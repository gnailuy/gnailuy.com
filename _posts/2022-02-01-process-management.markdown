---
layout: post
title: "Process management and scheduling"
date: 2022-01-21 20:42:06 +0800
categories: [ linux ]
---

An overview of process management in [the Linux kernel][kernel-archives].

<!-- more -->

## The process

A process is a running program and related resources.
It is the living result and the container of isolation of a running program, including:

1. One or more threads of execution, including the thread ID, the program counter (PC), stack and stack pointer, a set of saved registers, and scheduling information.
2. The resources it uses, such as open files/sockets, signals, mutexes, processor state data, and other memory space (heap, shared libraries, etc.).
3. The code (`text` section) that it executes.
4. The `data`/`bss` section which contains global variables or uninitialized variables.

Modern operating systems, including Linux, provide mainly two types of virtualization for processes: virtual memory and virtual processor.

### Virtual memory

With virtual memory support, the process can allocate and manage memory as if it owned all the memory in the system.

From the process/programmer's perspective, memory access uses virtual memory addresses,
which are translated to physical memory addresses by the MMU with the help of page tables.

<center>
{% image fullWidth memory_layout.png alt="Linux Process Memory Layout (X86 32 Bits)" %}
</center>

The above image from [this blog][gustavo2009] shows the virtual memory layout of a process in Linux.
We will come back to memory management in later posts.

### Virtual processor

On modern operating systems, the process also runs as if it alone monopolizes the CPU,
despite the fact that it is sharing the CPU with other processes.

The kernel schedules the processes and decides which processes to run, at what time, and for how long.

## Process from programmer's point of view

A process is created by its parent process by calling the `fork()` system call, which internally called the `clone()` system call.

The `clone()` system call duplicates a task data structure, assign it a new PID,
and copies necessary resources such as open files and signal handlers depending on the flags passed to it.
(Interestingly, a thread in Linux is implemented as a process that `clone()`s more shared data than regular process do.)

After `fork()` returns, the parent resumes execution and the child process starts execution from the same place.
The `fork()` system call returns twice:

1. In the child process, the return value is 0.
2. In the parent process, the return value is the PID of the child process.

Programmers can use this return value to distinguish the child process from the parent process.

Often, the child process is used to execute a new, different program.
We can use the `exec()` family of system calls to create a new address space and load a new program into it.

Finally, a process can exit by calling the `exit()` system call.
This system call terminates the process and frees all resources associated with it.

A parent process can wait for a child process to exit by calling the `wait()/waitpid()` function,
which internally calls the `wait4()` system call.

## Process data structure

Internally, a process is represented by a `struct task_struct` structure, which is also referred as a process descriptor.
The kernel maintains a circular doubly linked list of all process descriptors.

<center>
{% image fullWidth task_struct.png alt="Linux task_struct Code Sample" %}
</center>

In the above code sample in [`linux-next`][linux-next],
the `struct task_struct` structure is defined in the `include/linux/sched.h` header file.

The process descriptor contains all the information that the kernel needs about a process,
including open files, signals, mutexes, processor state, memory address spaces, and the process ID (Line 950 in commit `cc570eff96`).

It is important for the kernel to quickly look up the process descriptor of the currently executing process.
On different architectures, the kernel uses different methods to do this, and it is abstracted by the `current` macro. (`./include/asm-generic/current.h`)

After Linux 2.6, the process descriptor is allocated dynamically.
A `struct thread_info` structure is allocated at the end of the process's kernel stack,
and it contains a pointer to the process descriptor.
The kernel uses the `current_thread_info()->task` call to get the current process descriptor address.

### Task link and task tree

There is a `next` pointer and a `prev` pointer in the process descriptor, which links the process as a doubly linked list.
You can use `for_each_process` to iterate through all processes (`./include/linux/sched/signal.h`).

There is also a `parent` pointer in the process descriptor, which points to the parent process descriptor,
Every process has exactly one parent, and zero or more children.
Thus all the processes in the system are linked in a tree structure, with the `init` process as the root process.

### Process state

The `state` field of the process descriptor contains the current state of the process.
There are five process states in Linux, which is defined in the `./include/linux/sched.h`.

<center>
{% image task_state.png alt="Linux Task States" %}
</center>

The kernel changes the process state when the situation changes.

<center>
{% image task_state_flow_chart.jpeg alt="Linux Task State Flow Chart" %}
</center>

#### Exiting and cleanup

When a process calls `exit()` system call, or it is terminated by a signal or exception,
it cleans up its resources, send a signal to its parent, and then changes its `exit_state` to `EXIT_ZOMBIE`.

After that, the process calls `do_exit()` and let the kernel switch to a new process.
At this point, the process descriptor `task_struct` and the `thread_info`, the kernel stack still exist.

The parent process needs to handle the child process exit signal, or tell the kernel it is uninterested,
then the kernel will free these memory resources.

Question: What if the parent process need to exit before the child process exits?

## Process scheduling

There are usually many processes that are in `TASK_RUNNING` state, which means they are ready to run.
It is the kernel's job to decide which process to run, and how long to run it.
This is done by the kernel scheduler, a kernel subsystem that is responsible for scheduling the processes.

Most modern operating systems, including Linux, employs preemptive multitasking.
In this model, each process is assigned a slice of CPU time to run, then it will be preempted by the kernel scheduler,
and the scheduler then decides which process to run next, and how long its time slice will be.

### What to consider when scheduling

1. Speed

The processor scheduler runs every time the system needs to decide which process to run.
Each time it runs, the input is a given set of runnable processes, and the output is the process to run next.

Since Linux kernel 2.5, a new scheduler named `O(1)` scheduler is introduced.
It can perform its work in constant time, which is a big improvement over the previous scheduler.

2. Latency and throughput

The `O(1)` scheduler has some issues when it comes to latency-sensitive tasks.
It is ideal for large server workloads, which lack of interactive processes, but performed poorly on desktop systems.

Processes can be classified as I/O-bound or CPU-bound.
Most desktop GUI applications are I/O-bound, because they spend most of their time waiting for user input.
Conversely, CPU-bound processes tend to spend much of their time executing code, until they are preempted by the kernel scheduler.

Since Linux kernel 2.6.23, the Completely Fair Scheduler (CFS) replaces the `O(1)` scheduler to improve the interactive performance.


[kernel-archives]:          https://www.kernel.org/
[gustavo2009]:              https://manybutfinite.com/post/anatomy-of-a-program-in-memory/
[linux-next]:               https://git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git
