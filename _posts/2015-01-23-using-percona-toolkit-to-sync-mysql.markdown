--- 
layout: post
title: "校验和修复 MySQL 主从数据库一致性"
date: 2015-01-23 02:14:59 +0800
categories: [ linux ]
---

这两天学习了一下 [Percona.com][ptookit] 提供的两个工具，
校验了 MySQL 里一个数据库里所有表的主从一致性，并修复发现的不一致。

<!-- more -->

大致的过程如下：

## 安装

这个 Tookit 安装非常简单，在[这里][downloads]下载，看下解压出来的 INSTALL 文件即可。

## 启动校验

在主库所在的机器上，执行：

``` bash
pt-table-checksum -u ${USER_NAME} -p${PASSWORD} -d ${DATABASE_NAME} \
    --no-check-replication-filters --replicate=${DATABASE_NAME}.checksums
```

其中，`-u` 和 `-p` 分别指定用户名和密码，`-d` 指定要校验的数据库；

`--no-check-replication-filters` 表示不需要检查 Master/Slave 配置里是否指定了 Filter。
默认会检查，如果配置了 Filter，如 `Replicate_Do_DB` `Replicate_Ignore_Table` 等，则报错退出；

`--replicate=` 指定了一张表，这里叫 checksums，`pt-table-checksum` 会创建这张表，并保存生成的校验信息。

`pt-table-checksum` 的文档在[这里][checksumtool]。
主要工作原理是，从 Master 所在的机器上启动之后，这个工具在主库里 `--replicate=` 指定的表 checksums 中创建如下的表结构：

| db | tbl | chunk | chunk_time | chunk_index | lower_boundary | upper_boundary | ... |
|:--:|:---:|:-----:|:----------:|:-----------:|:--------------:|:--------------:|:---:|

| ... (continued) | this_crc | this_cnt | master_crc | master_cnt | ts |
|:---------------:|:--------:|:--------:|:----------:|:----------:|:--:|

然后它将每张需要校验的表切分成 Chunk，每个 Chunk 包含多个 Row，然后对每个 Chunk 求校验和。

在上面的表结构里，db 是数据库名，tbl 是表名，chunk 是 Chunk 号，lower/upper boundary 分别是该 Chunk 的起始/结束 Row；
this_crc 和 this_cnt 指本表上该 Chunk 的 CRC 校验和与 Row 条数，master_crc 和 master_cnt 则是 Master 机器上的这两个值。

在 Master 库上，this_crc/this_cnt 和 master_crc/master_cnt 都是本机的值，因此是一样的。

该表需要被 MySQL 自动同步到所有的 Slave 机器上去，因此该表必须包含在 Master/Slave 配置的 Filter 范围内。

在 Slave 机器上的 checksum 表中，this_crc 和 this_cnt 是在本地计算出来的，而 master_crc 和 master_cnt 是从 Master 同步过来的。
因此，Slave 的 checksums 表中，这两对值如果一致，则表示没有 differ，如果不一致，则表示两个 Chunk 是不一致的。

## 打印检查要执行的修复语句

在主库所在的机器上，执行：

``` bash
pt-table-sync --print -u ${USER_NAME} -p${PASSWORD} -d ${DATABASE_NAME} \
    --replicate=${DATABASE_NAME}.checksums --algorithms=Nibble,GroupBy,Stream \
    h=${IP_OF_MASTER}
```

`pt-table-sync` 的文档在[这里][synctool]。

这里使用 `--print` 参数，只是将该工具要执行的操作打印出来供检查，并不真正执行。
要注意在大的表上，即使只是打印这些操作内容，也可能需要花很长时间。

上述命令行里，`--replicate=` 参数指定的就是 `pt-table-checksum` 生成的 checksums 表；`h=` 参数是 Master 机器的 IP 地址。

我这里使用 `--algorithms=` 参数指定的算法列表里，没有默认的最高优先级算法 'Chunk'。
因为使用 'Chunk' 算法在测试数据库上进行同步测试时，出现下面的错误提示：

> Failed to prepare TableSyncChunk plugin: Cannot chunk table `dbname`.`tablename` using the character column KEY, most likely because all values start with the same character.
> This table must be synced separately by specifying a list of --algorithms without the Chunk algorithm at /usr/local/bin/pt-table-sync line 4049.
> while doing dbname.tablename on IP_OF_SLAVE

这个工具本质上不会直接操作 Slave 机器，而是通过在 Master 机器上做出'修改'，然后由 MySQL 同步到 Slave 上去。
而在 Master 上做的'修改'，其实并不会修改 Master 中的数据：
'the changes it makes on the master should be no-op changes that set the data to their current values, and actually affect only the replica.'

上述只是 `pt-table-sync` 的一个用法：
利用 `pt-table-checksum` 工具产生的 checksums 信息来同步 Slave 上的数据到和 Master 一致。
还有一些其他用法可以参考文档。要注意这个工具在 `--execute` 时，会真的修改数据，因此最好是在线下测试后再上线操作。

## 启动同步，修复 Slaves 上的数据

在主库所在的机器上，执行：

``` bash
pt-table-sync --execute -u ${USER_NAME} -p${PASSWORD} -d ${DATABASE_NAME} \
    --replicate=${DATABASE_NAME}.checksums --algorithms=Nibble,GroupBy,Stream \
    h=${IP_OF_MASTER}
```

如果对 `--print` 出的结果没有异议，那么就可以真正的执行同步命令了。

## 在 Slave 机器上同步 Master 到本地数据库

我在一个 1 Master + 3 Slaves 的数据库集群上用上述命令，尝试将 Master 同步到所有的 Slaves，
但是发现最终只同步成功了其中一个 Slave，其他 Slave 机器还有些多于 Master 的数据没有删除。
看文档的参数说明，没有看出个所以然来，可能是检测 Slave 时出现了问题。

因此我又使用了下面的命令，从每个 Slave 上执行，将 Master 同步到本地 Slave。

``` bash
pt-table-sync --execute -u ${USER_NAME} -p${PASSWORD} -d ${DATABASE_NAME} \
    --replicate=${DATABASE_NAME}.checksums --algorithms=Nibble,GroupBy,Stream \
    --sync-to-master ${IP_OF_THIS_SLAVE}
```

这次成功把所有 Slave 都同步成功了。

[ptookit]:      http://www.percona.com/
[downloads]:    http://www.percona.com/doc/percona-toolkit/2.2/installation.html
[checksumtool]: http://www.percona.com/doc/percona-toolkit/2.2/pt-table-checksum.html
[synctool]:     http://www.percona.com/doc/percona-toolkit/2.2/pt-table-sync.html
