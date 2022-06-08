---
layout: post
title: "Process management: Overview"
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

The `clone()` system call duplicates a task data structure (CoW), assign it a new PID,
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

### Process descriptor content

The process descriptor contains all the information that the kernel needs about a process,
including the process properties, scheduling information, the program counter,
saved register data, memory space, file system information, etc..

Some examples in `struct task_struct` are:

* Process properties
    * pid: Unique process (thread) ID (Line 946 in commit `09688c0166e7`).
    * tgid: Unique process ID of the process group (process) (Line 947 in commit `09688c0166e7`).
    * state, exit_state, etc.: Used to track the process state, such as running, pending, existing, etc..
    * flags, exit_code, comm, uid, gid, etc..
* Scheduling properties
    * prio, static_prio, normal_prio, rt_priority, etc.: Process priority properties.
    * policy: Process scheduling policy.
    * sched_class: The scheduling class of the process.
    * se, rt, dl, etc.: Scheduling class instance.
* Process links
    * real_parent, parent: If the process is not traced, the parent is the real parent.
    * children: A list of all the children of the process.
    * sibling: A pointer to the next sibling of the process.
    * group_leader: A pointer to the leader of the process group.
* Memory and file system
    * mm: A pointer to the `mm_struct` member.
    * fs: File system pointer.
    * files: File descriptor table.

The `task_struct` is initialized in the `init_task` structure in `./init/init_task.c`.

Note that the `pid` in the kernel source actually means the thread ID from the user space application's view (such as `ps`).
And the process ID (PID) returned by `ps` is actually the `tgid` in the kernel source.
There is a little confuse in these terms.
In [this blog post][pidtidppidtgid] there is a nice explanation of the difference. See the `PID, TID, PPID, and TGID` section.

### Process descriptor lookup

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
Thus all the processes in the system are linked in a tree structure, with the `init` process (pid 1) as the root process.

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


[kernel-archives]:          https://www.kernel.org/
[gustavo2009]:              https://manybutfinite.com/post/anatomy-of-a-program-in-memory/
[linux-next]:               https://git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git
[pidtidppidtgid]:           https://helix979.github.io/jkoo/post/os-scheduler/
