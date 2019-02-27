---
layout: post
title: "Hadoop MapReduce 任务设计的几个常用技术"
date: 2015-11-22 15:18:50 +0800
categories: [ dataplatform ]
---

MapReduce 计算模型简单而有效，很多常见的计算问题都可以使用
Input -> Map -> Shuffle & Sort -> Reduce -> Output
这样简单的流程来实现，并在 Hadoop 这样的系统上进行大规模、分布式的数据处理。
尽管目前 Spark 这样较新的大数据处理模型/框架日益流行，
然而新计算模型的出现并不意味着 MapReduce 会被立刻取代，
而是意味着我们解决问题的时候有了更多的思路和方法，
也意味着一个数据工程师有了更多的工具需要学习、掌握和选择。

<!-- more -->

MapReduce 不擅长或者不能处理的问题需要新的系统来解决，而 MapReduce
长于处理的问题我们则希望充分利用这个框架的特性。
这篇文章里我们就从我们团队日常开发的实际经验出发，
聊一聊 Hadoop 中 MapReduce 任务设计时经常使用到的几个小技术。

### Multiple Inputs

多路输入常用于下面两种情况：

1. 一个任务的输入有多个数据源，且多个数据源有不同的格式时；
2. 一个任务的多个输入数据源需要不同的 Mapper 做不同逻辑的处理时。

多路输入的使用非常简单，就是将普通的 *addInputPath()* 方式替换为下面的方式：

``` Java
MultipleInputs.addInputPath(job, new Path("/path/to/inputX/"),
    XXXInputFormat.class, XXXMapper.class);
MultipleInputs.addInputPath(job, new Path("/path/to/inputY/"),
    YYYInputFormat.class, YYYMapper.class);
```

而某一路输入是 HBase Scan 时，也可以使用类似的方式：

``` Java
conf.set(TableInputFormat.SCAN, TableMapReduceUtil.convertScanToString(yourScan));
conf.set(TableInputFormat.INPUT_TABLE, tableName);

MultipleInputs.addInputPath(job, new Path(tableName), // or whatever path, doesn't matter
    TableInputFormat.class, XXXTableMapper.class);
```

当多路数据源有不同的格式时，可以对不同数据源使用不同的 InputFormat 来分别输入；
而当需要对不同输入进行不同逻辑的处理时，可以通过编写不同的 Mapper 来实现。

此外，有一种特殊的多路输入情况。
就是任务有多路输入数据，每一路数据都有相同格式，也需要做相同的处理，
只是处理时需要根据数据的输入路径做一些不同处理，
例如为不同来源的数据打上不同标签，供后续 Reducer 中区分处理。
这种情况如果使用 MultipleInputs 来处理，就需要定义多个功能类似的 Mapper 类，
各个 Mapper 只有细微的不同，代码会比较不好看。
其实如果只是想根据输入路径对数据做不同的处理，可以直接在 Mapper
中获取输入数据的路径：

```Java
Path inputPath = ((FileSplit) context.getInputSplit()).getPath();
```

这个方法通常可以在 Mapper 的 *setup()* 方法中调用一次，获得 Input Path 之后，
就可以在 *map()* 方法中根据 Input Path 区分输入数据的来源了。
对于每一个 Input Split，Mapper 的 *run()* 方法都会先调用 *setup()*，
然后对这个 Split 中的每一个 Record 执行 *map()* 方法，最后 *cleanup()*。

#### Multiple Outputs

在我们这边的日常开发中，多路输出的使用比多路输入更常见一点。
有时是需要从一个任务中输出多路数据供后续的多个流程进行处理，
有时则是需要在主要输出之外增加一路副输出，用于 HBase 表更新、异常数据分流、
数据抽样等情况。

多路输出的使用也很容易，和普通的写文件流程 Open, Write 和 Close 有点类似。
通常情况下，我们会先在写 Job Driver 时定义一些 Named Output：

``` Java
MultipleOutputs.addNamedOutput(job, "outputXName",
    XXXOutputFormat.class, OutputXKey.class, OutputXValue.class);
MultipleOutputs.addNamedOutput(job, "outputYName",
    YYYOutputFormat.class, OutputYKey.class, OutputYValue.class);
```

然后在 Mapper 或者 Reducer 的 *setup()* 方法中创建一个 MultipleOutpus：

``` Java
mos = new MultipleOutputs(context);
```

在需要输出数据的地方，可以使用定义好的 mos 进行输出：

``` Java
mos.write("outputName", key, value);
mos.write("outputName", key, value, "filePrefix");
mos.write("outputName", key, value, "path/filePrefix");
```

这里，第一种输出方式将数据写到任务输出目录下的 *outputName/part-m|r-xxxxx*，
第二种输出方式将数据写到任务输出目录下的 *filePrefix-m|r-xxxxx*，
而第三种输出方式则将数据写到任务输出目录下的 *path/filePrefix-m|r-xxxxx*。

最后需要在 *cleanup()* 方法中关闭 MultipleOutputs，否则写入 mos 的输出都将无效：

``` Java
mos.close();
```

另外值得一提的是，如果使用了多路输出时，没有在 Reducer 调用过 *context.write()*
进行输出，那么任务的输出目录中还是会生成一堆空的 *part-r-xxxxx* 文件。
如果要避免生成这些空文件，可以使用 LazyOutputFormat。

#### Composite Key & Secondary Sort

MapReduce 计算模型中，Shuffle 和 Sort 部分可以自定义的地方相对较少，
框架提供的功能大部分情况下能够满足需要。
这里，我们只提一下 Composite Key 和 Secondary Sort。

首先简单回顾一下 MapReduce 框架的特性。对于 Mapper 输出的 \<KEY, VALUE\> 对：

1. Partitioner 根据 KEY 将它们分配给不同的 Reducer， 默认 Partitioner
就是保证相同的 KEY 会分配到同一个 Reducer；
2. 根据 KEY 的 Sort Comparator 实现，输入给 Reducer 的 \<KEY, VALUE\>
按照 KEY 排序；
3. 根据 Grouping Comparator 的实现，KEY 相等的 VALUES 会被聚合到一起，
由同一个 *reduce()* 方法遍历处理。

因此，通过定义不同的 Partitioner, Sort Comparator 和 Grouping Comparator，
可以实现相对灵活的排序和聚合效果：

``` Java
job.setSortComparatorClass(SortComparator.class);
job.setGroupingComparatorClass(GroupingComparator.class);
job.setPartitionerClass(Partitioner.class);
```

举个例子，假设我们有一份数据，每个数据条目包含 *Key1: String*, *Key2: String* 和
*Value: Long* 三个部分。
现在需要设计一个 MapReduce 任务，针对 *Key1* 进行聚合计算，要求得到每个 *Key1*
的 *Value* 均值，以及每个 *Key1* 对应独立 *Key2* 个数。

我们可以定义一个 Composite Key 类，包含两个字段：Natural Key 和 Marker。

<center>
{% image halfWidth compositekey.png alt="Composite Key" %}
</center>

并且定义 Partitioner 只根据 Natural Key 的 *hashCode()* 分区，
Grouping Comparator 也只根据 Natural Key 的 *compare()* 方法做 KEY 比较，
而 Sort Comparator 则先根据 Natural Key 进行 *compare()*，如果 Natural Key
相等，再根据 Marker 进行 *compare()*。

Mapper 输出 KEY 时，Natural Key 设置为 *Key1*，而 Marker 设置为 *Key2*；
Mapper 输出的 VALUE 则包含输入数据中的 *Value* 以及 *Key2* 两个部分。
这样就可以实现每个 *Key1* 的数据由单个 *reduce()* 方法处理，并且 VALUES
按照 *Key2* 排序的效果。
如此，计算每个 *Key1* 的独立 *Key2* 个数，以及 *Value* 均值等需求就非常容易了。

当然，这个简单的需求不定义单独的 Composite Key 类也是可能的。
只需要将 *Key1* 和 *Key2* 以独特的分隔符拼接成一个字符串，
定义 Partitioner 和 Grouping Comparator 只对比 *Key1*，
Sort Comparator 则对比 *Key1 + Key2* 就可以了。

#### Partitioner

上面讨论 Secondary Sort 时，已经提到过 Partitioner 的原理和用法。
通常情况下，默认的 Partitioner 按照 KEY 的 *hashCode()* 进行分区，
这样可以达到均匀分区的效果，理想情况下，每个 Reducer 分配到的数据也是均匀的。

特殊情况下，默认 Partitioner 的均匀分区方法也可能不满足实际应用的需要。
例如数据严重倾斜的情况，或者逻辑、性能等特殊情况下要求每个 Reducer
的输入 KEY 连续的情况等。

Partitioner 中的关键方法是 *getPartition()*，一个哈希的 Partitioner 如下：

``` Java
public int getPartition(KEY key, VALUE val, int numReduceTasks) {
    return (hash32(key) & Integer.MAX_VALUE) % numReduceTasks;
}
```

通过自定义 *getPartition()*，就可以实现一些特殊的需求，
上面的 Secondary Sort 其实也算是一种特殊需求了。
此外，Hadoop 发行版中还提供了一些有用的 Partitioner，例如 TotalOrderPartitioner。
这个 Partitioner 会读取一个 *_partition.lst* 的文件，
这个文件中保存有预先定义的、排序的 KEY 列表，Partitioner 以这些 KEY
作为分区分界点，实现全局有序的分区。

在一个对 HBase 进行连续 Point Query 的任务中，我们通过实现全局有序分区，
使得每个 Reducer 中都按照 Rowkey 自然顺序访问 HBase，提高了 HBase BlockCache
的命中率，使得程序运行时间缩短为优化前的三分之一。

#### Distributed Cache

Distributed Cache 在 MapReduce 任务中应用很广，
它可以大大提高一些被频繁读取文件的访问速度。
一个常见的应用是，通过 *hadoop* 命令的 *-files* 参数，
将逗号分隔的一个或多个文件加入 Distributed Cache。
此外，还可以在任务代码中添加文件到 Distributed Cache：

``` Java
DistributedCache.addCacheFile(new URI("/path/to/filename#linkname"),
        job.getConfiguration());
DistributedCache.addCacheArchive(new URI("/path/to/archive.tgz",
        job.getConfiguration());
```

被添加到 Distributed Cache 的文件会被拷贝到 Mapper 和 Reducer 的运行目录中，
压缩归档文件还会被解压。
因此可以通过简单的本地读写 API 访问它们，访问速度通常也比从 HDFS 读写快很多，
非常适合保存经常被读取的小文件。

#### 结语

MapReduce 适用于对大批量、不能全部加载到内存的数据进行批处理，
使用好 Hadoop 框架提供的特性，可以更加高效、优雅的解决问题。
在我们的使用中，大部分常见的数据处理需求都可以用 MapReduce 很好的处理，
关于 MapReduce 适用于解决哪些问题的探讨，这里推荐一本叫做
[*MapReduce Design Pattern*][mrdp] 的书，
这本书用 200 多页的篇幅，介绍了常见的一些 MapReduce 算法设计模式，
是一本不错的设计指南。

#### TheFortyTwo

我们数据平台的程序员们做了一个微信公众号，叫做 **TheFortyTwo**，
我们会在工作之余，<del>每周</del>为大家推送原创技术文章，
或者优秀的技术文章一手翻译，
目前主要关注于数据处理领域，但也并无严格限制。
上面这篇文章也发表在了这个公众号上面，欢迎大家搜索 **TheFortyTwo**，
或者微信扫描下面二维码，关注我们。

<center>
{% image twoThirdsWidth thefortytwo.png alt="TheFortyTwo" %}
</center>

[mrdp]:     http://shop.oreilly.com/product/0636920025122.do

