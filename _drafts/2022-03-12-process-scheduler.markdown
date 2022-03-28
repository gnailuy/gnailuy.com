---
layout: post
title: "Process management: Scheduling"
date: 2022-03-12 10:23:36 +0800
categories: [ linux ]
---

Process scheduling in [the Linux kernel][kernel-archives].

<!-- more -->

## Process scheduling

In modern systems, there are usually many processes that are in `TASK_RUNNING` state, which means they are ready to run.
It is the kernel's job to decide which process to run, and how long to run it.
This is done by the kernel scheduler, a [kernel subsystem][linux-kernel-map] that is responsible for scheduling the processes.

Most modern operating systems, including Linux, employs preemptive multitasking.
In this model, each process is assigned a slice of CPU time to run, then it will be preempted by the kernel scheduler,
and the scheduler then decides which process to run next, and how long its time slice will be.
A process can also relinquishes its CPU slice, for example when a process need to wait for a resource to become available.
The scheduler also needs to select the next process if this happens.

When a processor changes to a new process, the scheduler is responsible for saving the state of the previous process,
including the registers (including the program counter) and the memory address space.
This is often referred to as the `context` of a process, thus switching from one process to another is called `context switch`.

### What to consider when scheduling

The processor scheduler runs every time the system needs to decide which process to run.
Each time it runs, the input is a given set of runnable processes, and the output is the process to run next.

* Speed

Since Linux kernel 2.5, a new scheduler named `O(1)` scheduler is introduced.
It can perform its work in constant time, which is a big improvement over the previous scheduler.

* Latency and throughput

The `O(1)` scheduler has some issues when it comes to latency-sensitive tasks.
It is ideal for large server workloads, which lack of interactive processes, but performed poorly on desktop systems.

Processes can be classified as I/O-bound or CPU-bound.
Most desktop GUI applications are I/O-bound, because they spend most of their time waiting for user input.
Conversely, CPU-bound processes tend to spend much of their time executing code, until they are preempted by the kernel scheduler.

Since Linux kernel 2.6.23, the Completely Fair Scheduler (CFS) replaces the `O(1)` scheduler to improve the interactive performance.

#### Process priority

There are four properties in `struct task_struct` that determine the priority of a process.

``` c
int       prio;
int       static_prio;
int       normal_prio;
unsigned int      rt_priority;
```

* `static_prio` is calculated from the `nice` value of the process (by a macro `NICE_TO_PRIO`). It does not change unless the user changes the `nice` value.
* `normal_prio` is calculated from the `static_prio` value and the schedule policy. For real-time processes, it is related to the `rt_priority` value.
* `prio` is a dynamic priority value which the schedule class actually uses.

#### Scheduling policy and algorithm

In next post.


[kernel-archives]:          https://www.kernel.org/
[linux-kernel-map]:         http://www.makelinux.net/kernel_map/LKM.pdf
