--- 
layout: post
title: "GSL 科学计算库、随机变量的 Erlang 分布与 Weibull 分布"
date: 2011-07-10 12:03:19 +0800
latex: true
categories: [ mathematics ]
---

本文首先简要介绍了 GNU 科学计算库 GSL 和随机变量的 Erlang 分布与 Weibull 分布，然后说明了 GSL 库如何生成服从 Erlang 分布或 Weibull 分布的随机数，以及在编程中如何使用 GSL 库。
对计算机生成的一系列随机数，可以有许多方法测试它们的分布，一个常见的测试是 Kolmogorov-Smirnov 测试，也称作 K-S Test。
云师姐的[这篇文章][ks-test]中有使用 Matlab 进行 K-S Test 的示例以及代码。

<!-- more -->

## 写在前面

今年五月曾在 [is-programmer.com][is-programmer] 申请了一个小博客。那时我正热衷于 TBS 的 Big Bang，加上注册时间早，二级域名竟然抢到了 sheldon。
这个 is-programmer.com 是个挺不错的博客系统，光看这名字就知道比较适合 ITer，加上后台支持 $\LaTeX$ 公式，很适合计算机和数学领域的用户。
如果你想弄个省心又免费的技术博客，我很愿意为 is-programmer.com 做一个免费广告 o(∩∩)o...

我在 [sheldon.is-programmer.com][sheldon] 上只写了一篇文章，叫 ["GSL 库生成 Erlang 分布的随机数"][gsl-erlang]。
这些天还在继续学习 GSL 库和 Weibull 分布的知识，顺便就把这篇文章翻出来，加上新东西，放在新站上。

## 正文

* GSL 及生成随机数的一般方法
* Erlang 分布简介
* Weibull 分布简介
* GSL 中生成服从 Erlang 分布或 Weibull 分布的方法
* 代码样例

### GSL 及生成随机数的一般方法

[GSL (GNU Scientific Library)][gsl] 是 [GNU 组织][gnu] 的数值计算 C/C++ 函数库。它是自由软件，依从 [GPL 协议][gpl]发布。
GSL 提供了大量关于数学计算的函数库，当然也包括本文用到的随机数生成函数。更多关于 GSL 的信息可以到 [GSL 的主页][gsl]去了解。

计算机中产生服从各种分布的随机数，其基础是产生服从均匀分布的随机数。得到服从均匀分布的随机数以后，可以通过许多不同的算法产生服从其他分布的随机数，
例如较常见的使用 Polar (Box-Mueller) 方法 (`gsl-1.9/randlist/gauss.c` 中函数 gsl\_rand\_gaussian) 或者使用 Ziggurat 方法 (`gsl-1.9/randlist/gausszig.c` 中函数 gsl\_rand\_gaussian\_ziggurat) 产生 Gaussian 分布的随机数等 (参考 William H.Press 等人的著作《C 数值算法》)。

服从均匀分布的随机数亦可由许多不同的随机数生成器来产生，不同的随机数生成器生成随机数的速度、随机性等均有差别。GSL 库提供了 12 种随机数生成器([来源][generator])。
其中速度最快的是 taus、gfsr4 和 mt19937 (default) 这三个生成器，而随机性最好的则是 ranlux 系列算法，也就是 GSL 的 ranlxs 系列生成器([来源][performance])。
ranlxs 系列生成器中，ranlxs0、ranlxs1 和 ranlxs2 产生 24 位单精度随机数，ranlxd1 和 ranlxd2 产生 48 位双精度随机数。
这五个生成器名字后面的数字代表 'luxury' 的程度不同，较高 'luxury' 程度的生成器产生的样本数据之间相关程度较低。
值得一提的是，计算机中这种使用确定算法产生的所谓随机数，都是伪随机数(参考 Knuth 的《计算机程序设计艺术》卷二)。
然而上述产生伪随机数的生成器由于具其生成的数据具有一定的随机性而得到了广泛的应用。

使用GSL库生成随机数的一般方法如下：

#### 一、创建一个随机数生成器实例

``` c
r = gsl_rng_alloc(T);
```

这里的 T 是 gsl\_rng\_type 类型的指针，它可以是 gsl\_rng\_default (即 gsl\_rng\_mt19937)、gsl\_rng\_ranlxs0 或者 gsl\_rng\_ranlxd1 等，用于指定使用不同的随机数生成器。

#### 二、生成种子

``` c
gsl_rng_default_seed = ((unsigned long)(time(NULL)));
```

同一般我们使用 C 语言中的 srand 和 rand 函数一样，通常我们采用当前时间作为种子，以提高随机性。

#### 三、生成服从指定分布的随机数

``` c
for (i=0; i<n; i++) {
    u = gsl_rng_uniform(r);
}
for (i=0; i<n; i++) {
    u = gsl_ran_erlang(r, erlang_a, erlang_n);
}
```

这里可以使用 GSL 提供的一系列函数生成服从各种不同分布的随机数，例如上述代码生成n个服从 Uniform 分布的随机数和 n 个服从 Erlang 分布的随机数，
其中参数 r 就是上述生成的随机数生成器实例的指针，其他参数将在后面解释。

#### 四、释放随机数生成器

``` c
gsl_rng_free(r);
```

类似于 C 中的 malloc 和 free 函数，这里的随机数生成器实例也需要进行释放，避免内存泄漏。

在 Linux 下使用 GSL 库很容易，各大发行版的软件源里都有，命令安装即可。对应的头文件通常是 `gsl/*.h`，编译时只需要在 `gcc` 命令中添加相应参数即可，可以参考下面两个命令：

``` bash
gcc `pkg-config --cflags --libs gsl` example.c -o example
gcc -lgsl -lgslcblas -lm example.c -o example
```

在 Windows 中使用 GSL 库要麻烦一些，如果你使用 MingW 的话，可以到[这里][gsl-win]下载 GSL 的库文件。GSL 为 MingW 和 Cygwin 等环境提供了 `.a` 格式的库，
使用起来相对容易一些，但是如果你使用 Virtual C++ 或者 Virtual Studio，就得麻烦不少。
这里展示一个使用 Virtual C++ 6.0 的可行的解决方案，其中使用到的库由 [Csabar Ferenc, Kiss][cfk] 制作，基于 GSL1.4.xx，不是最新的版本，但是也能用。
使用方法如下：

* 到 http://www6.in.tum.de/~kiss/WinGsl.htm 下载 WinGsl-Lib-1.4.02.zip，解压到某个目录下面，例如 `C:\WinGsl`；
* 打开 Virtual C++，点击菜单 Tools/Options...，在弹出的对话框里选择 Directories 选项卡；
* 在 Show directories for 标签下选择 Include files，然后在下面的 Directories 里添加刚刚解压的目录，这里是 `C:\WinGsl`；
* 在Show directories for标签下选择Library files，然后在下面的Directories里添加目录C:\WinGsl\Lib；
* 复制 `C:\WinGsl\Bin` 下的两个文件 `WinGsl.dll` 和 `WinGslD.dll` 到 Virtual C++ 安装目录里的相应目录，例如 `C:\Program Files\Microsoft Visual Studio\VC98\Bin`；
* 建立工程，打开菜单 Project/Settings...，在弹出的对话框选择 Link 选项卡，工程需要用到哪些库里的函数，就把要用到的库文件名添加到 Object/library modules 下面的文本框里，通常添加文件 `WinGslLib_s.lib` 即可。

### Erlang 分布简介

[Erlang 分布][erlang]是一种连续型概率分布，在排队论和随机过程等理论中都有应用。Erlang 分布与指数分布一样多用来表示独立随机事件发生的间隔，Erlang 分布不具有[马尔可夫性][markov]。其概率密度函数如下：

$$
f(x)=\begin{cases}\frac{\lambda(\lambda x)^{k-1}}{(k-1)!}e^{-\lambda x}, & x>0\cr 0, & x\le 0\end{cases}
$$

Erlang 分布有两个参数：一个是[形状参数][shape-param] (Shape Parameter) $k \in \mathbb{N}$，又称作阶数 (stage)，形状参数影响曲线形状，而不仅仅是移位或者缩放；
另一个是[比率参数][rate-param] (Rate Parameter) $\lambda \geq 0$，或用[尺度参数][scale-param] (Scale Parameter) $\mu$ (其中 $\mu=\frac{1}{\lambda}$)，
尺度参数按比例影响曲线的大小，但不改变形状。
阶数为 k 的 Erlang 分布常被称作 k- 阶 Erlang 分布 (Erlang-k distribution)。

遵循 Erlang 分布的随机变量可以分解成多个同参数指数分布的随机变量之和，当阶数 $k=1$ 时，Erlang 分布就退化为指数分布。

此事可以直观理解，柏松过程的两个相邻事件到达时间间隔服从指数分布，而从 0 时刻直到第 k 个事件发生的到达时间则服从 Erlang 分布。

设一柏松过程的到达时间间隔序列为 $\\{X\_k, k\geq 1\\}$，则若 $X\_k$ 服从参数为 $\lambda$ 的指数分布，到达时间 $S\_k = \sum\_{i=1}^kX\_i$ 就服从参数为 $(k, \lambda)$ 的 Erlang 分布。

Erlang 分布是 [Gamma 分布][gamma]的特殊情况，Gamma 分布的概率密度函数为：

$$
f(x) = \begin{cases} \frac{\lambda(\lambda x)^{\alpha-1}}{\Gamma(\alpha)}e^{-\lambda x}, & x>0\cr 0, & x\le0\cr \end{cases}
$$

其中 $\lambda>0$ 是比率参数，亦可使用尺度参数 $\theta=\frac{1}{\lambda}$。$\alpha>0$ 是形状参数。
$\Gamma(\alpha)$ 被称作是 Gamma 函数，Gamma 函数可以看作是阶乘的扩展，它有下面的特征([来源][gamma-fun])：

$$
\begin{cases}\Gamma(\alpha)=(\alpha-1)! & \mbox{if }\alpha\mbox{ is }\mathbb{Z}^+\cr \Gamma(\alpha)=(\alpha-1)\Gamma(\alpha-1) & \mbox{if }\alpha\mbox{ is }\mathbb{Z}^+\cr \Gamma \left( \frac{1}{2} \right) = \sqrt{\pi}\end{cases}
$$

当形状参数 $\alpha$ 限制为只能是整数时，Gamma 分布就成了 Erlang 分布。在 GSL 库中，对 Erlang 分布的计算其实就是利用 Gamma 分布的有关计算函数进行的。

### Weibull 分布简介

[Weibull 分布][weibull]也是一种连续型概率分布，这种分布常用于可靠性工程和失效分析等领域。Weibull 分布有二参数和三参数的不同表示方式，其中二参数表示的概率密度函数为：

$$
f(x)=\begin{cases}\frac{k}{\lambda}\left(\frac{x}{\lambda}\right)^{k-1}e^{-(x/\lambda)^{k}} & x\geq0\cr 0 & x<0\end{cases}
$$

其中 $k>0$ 为形状参数，$\lambda>0$ 为尺度参数。

Weibull 分布也与许多其他分布相关，例如当形状参数 $k=1$ 时它是[指数分布 (Exponential Distribution)][exponential]，$k=2$ 时则是 [Rayleigh 分布][rayleigh]。
形状参数 k 对 Weibull 的分布的概率密度曲线影响很大，具体可参考[这里][weibull-prop]。

如果将服从 Weibull 分布的随机变量 x 看作是系统的 'time-to-failure'，则 ['failure rate'][failure-rate] （描述失效可能发生的概率，不好翻译）与时间的 $k-1$ 次方成比例。
如果 $k<1$，则 'failure rate' 与随时间单调递减；如果 $k=1$，认为系统有恒定的 'failure rate'；
如果 $k>1$，则随着时间增长，系统失效的可能性越来越大，这种分布可以用来描述老化现象中的 'time-to-failure'([来源][ttf])。

另外还有一种三参数的 Weibull 分布，其概率密度函数如下：

$$
f(x;\lambda,k,\theta) = \begin{cases} \frac{k}{\lambda} \left(\frac{x - \theta}{\lambda}\right)^{k-1} e^{-(\frac{x-\theta}{\lambda})^k} & x \geq \theta \cr 0 & x<\theta \end{cases}
$$

其中$\lambda$ 与 k 同二参数的 Weibull 分布，$\theta$ 称作位置参数，当 $\theta=0$ 时，就退化成了二参数的 Weibull。

Weibull 分布还有下面一个重要的性质。如果有 x 服从区间 (0, 1) 上的 Uniform 分布，则有：

$$
\lambda(-\ln(x))^{1/k} \sim Weibull(\lambda, k)
$$

GSL 库中生成服从 Weibull 分布的随机数，就是采用这条性质从一个 Uniform 分布的随机数计算而来的。

### GSL 中生成服从 Erlang 分布或 Weibull 分布的方法

#### Erlang 分布

GSL 的源代码文件 `randlist/erlang.c` 中提供了两个关于 Erlang 分布的函数：

``` c
double gsl_ran_erlang (const gsl_rng * r, const double a, const double n);
double gsl_ran_erlang_pdf (const double x, const double a, const double n);
```

其中参数 r 为随机数生成器指针，a 代表尺度参数 $\mu = \frac{1}{\lambda}$，n 代表形状参数 k。
函数 `gsl_ran_erlang ()` 返回服从相应 Erlang 分布的随机数，而 `gsl_ran_erlang_pdf (x)` 计算参数为 (n, a) 的 Erlang 分布在 x 处的概率密度。

从上文叙述中可知，Erlang 分布可看做是形状参数 $\alpha$ 为整数的 Gamma 分布。
因此生成服从 Erlang 分布的随机数就可以由生成服从 Gamma 分布随机数的函数代劳，GSL 库中也正是这么做的。
在实现上，函数 `gsl_ran_erlang ()` 将传给它的三个参数原样传给文件 `randlist/gamma.c` 中的函数：

``` c
double gsl_ran_gamma (const gsl_rng * r, const double a, const double n);
```

`gsl_ran_gamma ()` 函数采用 George Marsaglia 与 Wai Wan Tsang 的 'marsaglia-tsang' 方法（[Google 上他们的论文][marsaglia-tsang]）生成服从 Gamma 分布的随机数。
在 [is-programmer][mt-brief] 上我曾经将这个方法的具体步骤重述了一下，现在觉得这样的叙述无意义，不如直接结合代码看论文，这段代码也很短。

最后再给出 `gsl_ran_erlang_pdf ()` 用于计算 x 处概率密度的公式：

$$
result = \begin{cases} \frac{exp((n-1)\ln\frac{x}{a}-\frac{n}{a}-lngamma)}{a}, & x>0\cr 0, & x\le0\cr \end{cases}
$$

公式中的 lngamma 是调用 `specfunc/gamma.c` 中的函数 `gsl_sf_lngamma ()` 计算的 $ln \Gamma(n)$，经过简单推导不难验证这个式子与 Erlang 分布的概率密度函数一致。

#### Weibull 分布

Weibull 分布相关文件 `randlist/weibull.c` 中，也有两个类似上面 Erlang 分布的函数：

``` c
double gsl_ran_weibull (const gsl_rng * r, const double a, const double b);
double gsl_ran_weibull_pdf (const double x, const double a, const double b);
```

类似的，参数 r 为随机数生成器指针，a 代表尺度参数 $\lambda$，b 代表形状参数 k。
函数 `gsl_ran_weibull ()` 返回服从相应 Weibull 分布的随机数，而 `gsl_ran_weibull_pdf (x)` 计算 x 处的概率密度。

回顾上一节 Weibull 的最后一条性质，可知由服从 Uniform 分布的随机数，可以计算得到服从 Weibull 分布的随机数。
因此 GSL 中产生服从 Weibull 分布的随机数非常简单，首先生成一个服从 Uniform 分布的随机数 x，然后返回：

$$
result=a (-\ln x)^\frac{1}{b}
$$

result 即服从 Weibull 分布。

接下来是 `gsl_ran_weibull_pdf ()` 对概率密度的计算，从代码中不难获知：

$$
result = \begin{cases} 0 & x < 0 \mbox{ or } x = 0, b \neq 1 \cr \frac{1}{a} & x = 0 \mbox{ and } b = 1 \cr \frac{e^{\frac{-x}{a}}}{a} & a > 0 \mbox{ and } b = 1 \cr \frac{b}{a} e^{-(\frac{x}{a})^b + (b-1)\ln{\frac{x}{a}}} & a > 0 \mbox{ and } b \neq 1 \end{cases}
$$

同样经过简单推导，上述公式是与 Weibull 分布的定义及概率密度函数符合的。

### 代码样例

#### 生成服从 Erlang 分布的随机数

{% highlight c linenos %}
//** Filename: erlang.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <gsl/gsl_rng.h>
#include <gsl/gsl_randist.h>

#define MAXRNDNUM 100

int main(int argc, char * argv[])
{
    const gsl_rng_type *T; // 随机数生成器类型指针
    gsl_rng *r; // 随机数生成器指针

    int i;
    double u; // 随机数变量

    const double erlang_a=0.6; // mu=0.6
    const double erlang_n=2.0; // n=2.0

    // gsl_rng_default (gsl_rng_mt19937)
    // gsl_rng_ranlxs0, gsl_rng_ranlxs1, gsl_rng_ranlxs2
    // gsl_rng_ranlxd1, gsl_rng_ranlxd2
    T = gsl_rng_ranlxs0;

    gsl_rng_default_seed = ((unsigned long)(time(NULL))); // 取当前时间作为种子
    r = gsl_rng_alloc(T); // 创建随机数生成器实例

    for (i=0; i<MAXRNDNUM; i++)
    {
    /** Functions:
     * double gsl_ran_erlang (const gsl_rng * r, const double a, const double n)
     * double gsl_ran_erlang_pdf (const double x, const double a, const double n)
     */
        u = gsl_ran_erlang(r, erlang_a, erlang_n); // 生成服从 Erlang 分布的随机数
        printf("%.5f\n", u);
    }

    // 打印 0.0, 1.0 处的概率密度值
    printf("erlang_pdf(0.0)=%.5f\n", gsl_ran_erlang_pdf(0.0, erlang_a, erlang_n));
    printf("erlang_pdf(1.0)=%.5f\n", gsl_ran_erlang_pdf(1.0, erlang_a, erlang_n));

    gsl_rng_free(r); // 释放随机数生成器

    return 0;
}
{% endhighlight %}

#### 生成服从 Weibull 分布的随机数

{% highlight c linenos %}
//** Filename: weibull.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <gsl/gsl_rng.h>
#include <gsl/gsl_randist.h>

#define MAXRNDNUM 100

int main(void)
{
    const gsl_rng_type *T; // 随机数生成器类型指针
    gsl_rng *r; // 随机数生成器指针

    int i; // 循环变量和生成随机数数目
    double u; // 随机数

    const double weibull_a=1.0; // lambda
    const double weibull_n=5.0; // k

    // gsl_rng_default (gsl_rng_mt19937)
    // gsl_rng_ranlxs0, gsl_rng_ranlxs1, gsl_rng_ranlxs2
    // gsl_rng_ranlxd1, gsl_rng_ranlxd2
    T = gsl_rng_ranlxs0;

    gsl_rng_default_seed = ((unsigned long)(time(NULL))); // 取当前时间作为种子
    r = gsl_rng_alloc(T); // 创建随机数生成器实例

    for (i=0; i<MAXRNDNUM; i++)
    {
        /** Functions:
         * double gsl_ran_weibull (const gsl_rng * r, const double a, const double b)
         * double gsl_ran_weibull_pdf (const double x, const double a, const double b)
         * double gsl_cdf_weibull_P (double x, double a, double b)
         * double gsl_cdf_weibull_Q (double x, double a, double b)
         * double gsl_cdf_weibull_Pinv (double P, double a, double b)
         * double gsl_cdf_weibull_Qinv (double Q, double a, double b)
         */
        u = gsl_ran_weibull(r, weibull_a, weibull_n); // 生成 Weibull 分布的数据
        printf("%.5f\n", u);
    }

    // 打印 0.0 1.0 处的概率密度值
    printf("weibull_pdf(0.0)=%.5f\n", gsl_ran_weibull_pdf(0.0, weibull_a, weibull_n));
    printf("weibull_pdf(1.0)=%.5f\n", gsl_ran_weibull_pdf(1.0, weibull_a, weibull_n));

    gsl_rng_free(r); // 释放随机数生成器

    return 0;
}
{% endhighlight %}

[ks-test]:          http://dapentiderizi.is-programmer.com/posts/26852.html
[is-programmer]:    http://is-programmer.com
[sheldon]:          http://sheldon.is-programmer.com/
[gsl-erlang]:       http://sheldon.is-programmer.com/posts/26819.html
[gsl]:              http://www.gnu.org/software/gsl/
[gnu]:              http://www.gnu.org/
[gpl]:              http://www.gnu.org/licenses/licenses.html
[generator]:        http://www.gnu.org/software/gsl/manual/html_node/Random-number-generator-algorithms.html
[performance]:      http://www.gnu.org/software/gsl/manual/html_node/Random-Number-Generator-Performance.html
[gsl-win]:          http://gnuwin32.sourceforge.net/packages/gsl.htm
[cfk]:              http://www6.in.tum.de/~kiss/
[erlang]:           http://en.wikipedia.org/wiki/Erlang_distribution
[markov]:           http://en.wikipedia.org/wiki/Markov_property
[shape-param]:      http://en.wikipedia.org/wiki/Shape_parameter
[rate-param]:       http://en.wikipedia.org/wiki/Rate_parameter#Rate_parameter
[scale-param]:      http://en.wikipedia.org/wiki/Scale_parameter
[gamma]:            http://en.wikipedia.org/wiki/Gamma_distribution
[gamma-fun]:        http://zh.wikipedia.org/wiki/伽玛分布
[weibull]:          http://en.wikipedia.org/wiki/Weibull_distribution
[exponential]:      http://en.wikipedia.org/wiki/Exponential_distribution
[rayleigh]:         http://en.wikipedia.org/wiki/Rayleigh_distribution
[weibull-prop]:     http://en.wikipedia.org/wiki/Weibull_distribution#Properties
[failure-rate]:     http://en.wikipedia.org/wiki/Failure_rate
[ttf]:              http://en.wikipedia.org/wiki/Weibull_distribution#Definition
[marsaglia-tsang]:  http://scholar.google.com/scholar?q=A+simple+method+for+generating+gamma+variables&hl=en&as_vis=1&btnG=Search&as_sdt=1%2C5&as_sdtp=on
[mt-brief]:         http://sheldon.is-programmer.com/posts/26819.html
