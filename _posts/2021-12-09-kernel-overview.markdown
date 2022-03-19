---
layout: post
title: "Linux kernel overview"
date: 2021-12-09 10:37:36 +0800
categories: [ linux ]
---

An overview and a study road map of operating systems and [the Linux kernel][kernel-archives].

<!-- more -->

## The operating system

An operating system is a piece of software that controls the computer hardware, be it a desktop, a mobile phone, or an embedded device.
It manages the hardware, and provides interfaces for the applications to use the hardware.

### Hardware

Hardware is at the base of a computer system.

* CPU
* Memory
* Disk Controllers
* Network Controllers
* Other I/O Devices

We have CPU that runs the computation tasks, and memory that stores the data.
These are the main computation resources of a computer system.
Apart from CPU and memory, we also have peripheral devices, such as disk controllers, network controllers, keyboards, and so on.

### Operating system

Operating system architecture:

<center>
{% image fullWidth kernel.gif alt="Operating System Architecture" %}
</center>

#### Applications

Service daemons, compiler, editor, browser, and other user applications.

#### Shell

A command-line user interface (CLI) or a graphical user interface (GUI) for access to the operating system's services.

Sh, Bash, Zsh, Gnome, etc.

#### Library routines

GNU C Library (glibc), Basic Mathematical Functions (libm), etc.

Applications, shell, and library routines are user space components.
From the perspective of the kernel, they are all upper level user processes that the kernel manages.

## Kernel

The kernel is the core component of the operating system.
It resides in the memory after the computer is booted, and tells the CPU what is the next task.

Kernel runs in privileged mode and has unrestricted access to the hardware.
Kernel has its own memory space called the kernel space.
User processes runs in user mode, and have restricted access to the hardware, such as their own memory and a subset of `safe` CPU operations.

The kernel is the primary interface between the hardware and the user processes.
Processes normally use [system calls][system-calls] to communicate with the kernel.

### System calls

System calls are the programming interface between the user process and the kernel.
It transfers the control from unprivileged user process to privileged kernel process via a software interrupt.

System calls can be divided into [5 categories][system-calls-categories]:

* Process Control: `fork()`, `execve()`, `exit()`, `kill()`
* File Management: `open()`, `close()`, `read()`, `write()`
* Device Management: `ioctl()`
* Information Maintenance: `getpid()`, `alarm()`, `sleep()`
* Communication: `pipe()`, `shmget()`, `mmap()`

### What does the kernel do

The kernel is organized into [a number of modules][linux-kernel-map].
The modules organization reflects the kernel's responsibilities.

#### Process management

The kernel is responsible for determining the next task to be executed (CPU scheduling).
It controls process creation and termination, signal handling, etc.

Process management includes the starting, pausing, resuming, scheduling, and terminating of processes.
In modern computer, processes run simultaneously by [context switch][context-switch].
Each process use the CPU for a small fraction of time (a time slice),
then pauses (interrupted by the CPU) and gives up the CPU,
so that the kernel can choose another process to run for another time slice.
Because the time slices are so small that humans cannot perceive them, the system appears to be multitasking.

During the context switch, the kernel saves the state of the current process,
performs kernel tasks, such as I/O operations, that came up during the preceding time slice,
then prepares memory and CPU for the next process, and switches the CPU to the next process.

#### Memory management

The kernel keeps track of all memory allocations, including which process owns which memory, and which memory is free.
It is responsible for page allocation, page fault handling, virtual memory management, etc.

The kernel has its own kernel space memory that only the kernel threads can access.
Each user process has its own user space memory, and one user process cannot access the unshared memory of another user process.
Modern operating system also uses virtual memory (swap) to provide more memory than the physical memory.

#### I/O management

It is usually the kernel's job to operate the hardware, and it acts as an interface between the user processes and the I/O devices.
The kernel provides an abstraction layer for hardware devices, such as the disk, the network interface, and the user I/O devices, in the form of file system, sockets, network protocols, and I/O controllers.
I/O events generate interrupts to the CPU, which then calls the kernel to perform the I/O operation.

#### Linux kernel modules

Modern Linux kernel are [modular kernel][lkm]. You can add new device drivers, filesystem drivers, network drivers, system calls, or other kernel modules without the need of rebooting.

## Kernel booting process

1. BIOS/UEFI reads MBR/GPT to find and run a boot loader (such as GRUB).
2. The boot loader core initializes to access disks and file systems.
3. The boot loader finds the kernel image (`vmlinuz`) on the disk, loads it to the main memory, and runs the kernel.
4. The kernel inspects and initializes the devices and drivers.
5. The kernel mounts the root file system (`initrd.img`).
6. The kernel starts the `init` process (process ID 1). From this point the user space starts.
7. `init` starts other processes (`fork()` and `exec()`). User space processes are usually managed by a service management service, such as `systemd`.
8. `init` starts a login process to allow the user to login.

## Kernel development environment

References: [1][reference1], [2][reference2], [3][reference3].

### Install tools and libraries

``` bash
# Build essentials and libraries
sudo apt install bison build-essential ccache fakeroot flex \
    kernel-package libelf-dev libncurses5-dev libssl-dev

# Development tools
sudo apt install git gdb

# QEMU emulator
sudo apt install qemu qemu-system
```

### Clone the kernel source code

``` bash
cd repository/
git clone git://git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git
```

### Configure the kernel build options

Use the default configuration for `x86_64` architecture.

``` bash
cd linux-next/
make ARCH=x86_64 x86_64_defconfig
```

Check that the kernel configuration is saved in `.config`.

Then use the text based UI to configure the kernel manually, adding GDB debugger options.

``` bash
make ARCH=x86_64 menuconfig
```

* Navigate to the *Kernel hacking* section and hit `Enter`.

<center>
{% image fullWidth kernel_hacking.png alt="Menu Config" %}
</center>

* Choose *Compile-time checks and compiler options*.

<center>
{% image fullWidth compiler_options.png alt="Menu Config" %}
</center>

* Select *Compile the kernel with debug info* and *Provide GDB scripts for kernel debugging*.

<center>
{% image fullWidth debug_info.png alt="Menu Config" %}
</center>

Save the configuration to `.config` and exit the TUI.

### Compile the kernel

``` bash
make -j8
```

The compressed kernel image is saved in `arch/x86/boot/bzImage`, `vmlinux` in the source root folder is an uncompressed version.

### Build a root file system

We need to build a root file system to boot the kernel.
[`Buildroot`][buildroot] is a 'simple, efficient and easy-to-use tool to generate embedded Linux systems through cross-compilation'.

``` bash
git clone git://git.buildroot.net/buildroot

cd buildroot
make menuconfig
```

Choose the `x86_64` architecture.

<center>
{% image fullWidth target_architecture.png alt="Menu Config" %}
</center>

And `ext2/3/4` file system.

<center>
{% image fullWidth filesystem.png alt="Menu Config" %}
</center>

Build the file system.

``` bash
make -j8
```

The file system image is saved in `output/images/rootfs.ext2`.

### Start the kernel with the root file system in QEMU

``` bash
qemu-system-x86_64 -kernel arch/x86/boot/bzImage -boot c -m 2049M \
    -hda ../buildroot/output/images/rootfs.ext2 \
    -append "root=/dev/sda rw console=ttyS0,115200 acpi=off nokaslr" \
    -serial stdio -display none
```

The system will boot with the kernel in the `bzImage` file and the root filesystem `rootfs.ext2`.

Use the `-s` option to allow gdb to connect to the QEMU instance (through TCP port 1234).
Use the `-S` option to stop the execution until you `continue` from the gdb.
This allows you to debug the kernel initialization process from `start_kernel()`.

Optionally, you can enable KVM with QEMU to improve the performance (`--enable-kvm`).

### Example: kernel debugging

Start the kernel with QEMU:

``` bash
qemu-system-x86_64 -s -kernel arch/x86/boot/bzImage -boot c -m 2049M \
    -hda ../buildroot/output/images/rootfs.ext2 \
    -append "root=/dev/sda rw console=ttyS0,115200 acpi=off nokaslr" \
    -serial stdio -display none
```

Configure your GDB to allow the startup script to run.
For simplicity, I just add the below command to my `~/.gdbinit` file.

``` text
set auto-load safe-path /
```

Them from another shell instance, run the `gdb` command:

``` bash
gdb ./vmlinux

(gdb) target remote :1234
```

Then you can use [GDB][gdb] ([Tutorial 1][gdb1], [Tutorial 2][gdb2], [Tutorial 3][gdb3], [TUI][tui]) to set break points and debug the kernel.

### Tip: find a symbol in the kernel source

``` bash
make tags
vim -t sys_fork
```


[kernel-archives]:          https://www.kernel.org/
[system-calls]:             https://man7.org/linux/man-pages/man2/syscalls.2.html
[system-calls-categories]:  https://www.geeksforgeeks.org/linux-system-call-in-detail/
[context-switch]:           https://en.wikipedia.org/wiki/Context_switch
[linux-kernel-map]:         http://www.makelinux.net/kernel_map/LKM.pdf
[lkm]:                      https://tldp.org/HOWTO/Module-HOWTO/x73.html
[reference1]:               https://medium.com/@daeseok.youn/prepare-the-environment-for-developing-linux-kernel-with-qemu-c55e37ba8ade
[reference2]:               http://nickdesaulniers.github.io/blog/2018/10/24/booting-a-custom-linux-kernel-in-qemu-and-debugging-it-with-gdb/
[reference3]:               https://theiotlearninginitiative.gitbook.io/coba/linux-kernel-development-environment
[buildroot]:                https://buildroot.org/
[gdb]:                      https://www.sourceware.org/gdb/
[gdb1]:                     https://sourceware.org/gdb/current/onlinedocs/gdb/
[gdb2]:                     https://www.cs.cmu.edu/~gilpin/tutorial/
[gdb3]:                     https://developers.redhat.com/blog/2021/04/30/the-gdb-developers-gnu-debugger-tutorial-part-1-getting-started-with-the-debugger
[tui]:                      https://sourceware.org/gdb/onlinedocs/gdb/TUI-Keys.html#TUI-Keys
