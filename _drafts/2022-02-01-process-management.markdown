---
layout: post
title: "Process management and scheduling"
date: 2021-02-01 20:42:06 +0800
categories: [ linux ]
---

An overview of process management in [the Linux kernel][kernel-archives].

<!-- more -->

## The process

A process is a running program and related resources. It is the living result of running program code, including:

1. One or more threads of execution, including the program counter (PC), process stack, and a set of registers.
2. The resources it uses, such as open files, signals, processor state data, memory space (heap, shared libraries, ...), and so on.
3. The code (`text` section) that it executes.
4. The `data`/`bss` section which contains global variables or uninitialized variables.

## Process life cycle

## Process scheduling

### Virtual memory

Modern operating systems provide virtual memory for processes, so that the process can allocate and manage memory as if it owned all the memory in the system.

From the process's perspective, memory access uses virtual memory addresses, which are translated to physical memory addresses by the MMU with the help of page tables.

<center>
{% image fullWidth memory_layout.png alt="Linux Process Memory Layout (X86 32 Bits)" %}
</center>

We will come back to memory management later.

### Virtual processor

On modern operating systems, the process also runs as if it alone monopolizes the CPU, despite the fact that it is sharing the CPU with other processes.
