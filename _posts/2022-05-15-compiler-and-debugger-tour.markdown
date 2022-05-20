---
layout: post
title: "A tour to GCC and GDB"
date: 2022-05-15 16:09:18 +0800
categories: [ linux ]
---

An introductory tour to the [`GNU Compiler Collection`][gcc] and the [`GUN Project Debugger`][gdb].

<!-- more -->

## Overview

The term `GCC` originally means the `GNU C Compiler` when it was first released by [Richard Stallman][RMS] in 1987.
But now it has evolved into a whole `GNU Compiler Collection`,
which supports various programming languages, hardware architectures, and operating systems.

`GCC` includes the compiler frontend that supports C, C++, Objective-C, Fortran, Go, and many other languages,
and the standard libraries for these languages.
It has a complex middle-end that optimizes the generated AST into a register-transfer language for a target architecture,
and supports different backend machine code generators.

`GCC` is a 100% free software from the [GNU Operating System][gnu-os] project,
and is the cornerstone stone of the magnificent world of free software.

In this post we will go over a brief tour of using the C compiler `gcc` in `GCC`
(we use the lower cased `gcc` and `gdb` to indicate the executables installed on your machine),
and understanding how the `GCC` compilers work.
We will also introduce the [`GNU Project Debugger`][gdb] (aka `GDB`), and explain briefly how a debugger works.

## Install `gcc` and `gdb`

On Ubuntu, `gcc` and `gdb` executables are included in the `build-essential` package,
so to install them, just run `sudo apt install build-essential`.

## The compiler `gcc`

### Prepare a simple C program

Let's have a two source files simple C program to use in our examples.

File: `hello.c`

``` c
#include <stdio.h>

void print_hello() {
    printf("Hello \n");
    printf("World\n");
}
```

File: `include/hello.h`

``` c
void print_hello();
```

File: `main.c`

``` c
#include <stdio.h>
#include <stdlib.h>

#include <hello.h>

int main(int argc, char *argv[]) {
    print_hello();

    int dividend, divisor;
    float result;

    dividend = atoi(argv[1]);
    divisor = atoi(argv[2]);
    result = dividend / divisor;

    printf("%d/%d = %f\n", dividend, divisor, result);

    return 0;
}
```

### The basic usage of `gcc`

To compile and run our program, just pass the file names to the `gcc` executable:

``` bash
gcc -o main main.c hello.c -I./include
./main 4 2
```

It prints:

``` text
Hello
World
4/2 = 2.000000
```

### Internal steps of `gcc`

Internally, `gcc` goes over several steps to transform your C source code
into the binary program `main` that the machine can load.
It is a multistage process involving several tools in the `GCC`,
and the command `gcc` you typed works like a wrapper of these tools.

Overall, the compile process of the above simple C program includes preprocessing, compiling, assembling, and linking.

#### Preprocessing

The first step is preprocessing.
In this step, `gcc` uses the C preprocessor (`cpp`) to expand the marcos and copy the header files to your source code.

We can use `gcc` to break down the steps, and the `-E` argument let `gcc` to only do preprocessing.

``` bash
gcc -E hello.c > hello.i
# or
cpp hello.c > hello.i
```

The `gcc` command is the equivalent of `cpp` command, as internally `gcc` just uses `cpp` to do the work.
It is a convention to use the `.i` and `.ii` extensions for C or C++ preprocessed source code files,
but they are really only expanded C/C++ source code.

#### Compiling

`gcc` compiles the C code into assembly code for the target machine architecture.

``` bash
gcc -S hello.c
# or
gcc -S hello.i
```

This command will generate a file `hello.s`, you can see the assembly code in this file.

#### Assembling

Assembly code are just human readable translation of the machine code instructions.
The assembler program `as` is used to assemble it into binary object file.

``` bash
gcc -c hello.c
# or
gcc -c hello.s
# or
as -o hello.o hello.s
```

This will generate file `hello.o`, called an object file.

In this example, our `hello.c` does not contain a `main` function, thus cannot run directly.
But even if you compile a standalone C program that contains `main` into an object file, it is still not ready to run.

We can get some hints from the file type of `hello.o`:

``` bash
file hello.o
```

It returns the below information on my machine.

``` text
hello.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
```

We can see that it is an 64-bit [`ELF`][elf] file, least-significant byte first (LSB), and `relocatable`.
In the `.o` object files, memory addresses of functions and variables are remain undefined.
We can use the [`readelf`][man-readelf] utility to check the symbol tables of the object file.
(Also checkout the [`objdump`][man-objdump] utility to examine an object file in details.)

``` bash
readelf --symbols hello.o | grep print_hello
```

It will print:

``` text
    10: 0000000000000000    35 FUNC    GLOBAL DEFAULT    1 print_hello
```

You can see the `Value` column of function `print_hello` and other symbols are all zeros.
It is the linker's job to merge the object files together, `relocate` the functions and variables, and resolve the addresses.

#### Linking

Let's first have our `main.c` compiled and assembled too:

``` bash
gcc -c main.c -I./include
```

Then link the two object files into an executable:

``` bash
gcc -o main hello.o main.o
```

There is also a standalone `ld` program that `gcc` uses to link the objects together,
but using `ld` directly requires a bunch of extra parameters, you can check [the manual][man-ld] for details.

Now if you check the symbol table of the `main` executable:

``` bash
readelf --symbols main | grep print_hello
```

And the result.

``` text
    67: 0000000000001207    35 FUNC    GLOBAL DEFAULT   16 print_hello
```

The symbol `print_hello` has an address.

### Other frequently used `gcc` options

* `-D name`, `-D name=value`: Define a macro name.
* `-I`: Extra search path for headers.
* `-On`: Optimization level `n`.
* `-Wall`: Enable all warnings.
* `-L`: Extra search path for libraries.
* `-l`: Link with a library.

Related environment variables:

* `C_INCLUDE_PATH`, `CPLUS_INCLUDE_PATH`: Search path for C/C++ headers.
* `LIBRARY_PATH`: Search path for static libraries. The linker (included in GCC) uses it to look for libraries.
* `LD_LIBRARY_PATH`: Search path for dynamic libraries. Not related to GCC itself, used by the loader (`ld-linux.so`) to find dynamic libraries for your program when it runs.

### Related topics

#### The compiler process

With `GCC` it is relative hard to examine the detailed compiler processes without diving into the source code.
`GCC` now uses very complex manually crafted [lexer][gcc-lexer] and [parser][gcc-parser] for performance.
For beginners, this [`GCC Tiny`][gcc-tiny] project is a good start to learn about the compiler frontend.

It is also recommended to use the [`LLVM`][llvm] project to learn the internals of modern compiler.
LLVM has well designed compiler frontend API and provides excellent compiler backend implementations,
so that you can [create a programming language][llvm-tutorial] easy and fast.

In this post we only use the LLVM based C compiler `clang` to demonstrate the intermediate result of lexer and parser:

``` bash
clang -fsyntax-only -Xclang -dump-tokens hello.c
clang -fsyntax-only -Xclang -ast-dump hello.c
```

#### Dynamically linking and loader

Modern programs are mostly dynamically linked,
thus when you view the ELF file you generated, not all symbols are resolved statically.

When the program needs to resolve dynamic libraries (`libxxx.so`), it relies on a loader,
on Linux, it is `ld-linux.so`, (`/lib64/ld-linux-x86-64.so.2` on my machine).

[This article][elf-article] explains well how an ELF file is loaded by the operating system,
and how the dynamic loader `ld-linux.so` works.

## The debugger `gdb`

A debugger runs the target program under controlled conditions.
It can usually let you set breakpoints, step into/over machine level instructions or high level language statements,
examine the variable values, and even modify the instructions or data.

### Compile the executable with debugging information

The debugger needs [extra information][dwarf], including the source code mapping,
to let you debug on high level languages instead of machine level instructions.
To compile the executable and produce debugging information:

``` bash
gcc -g3 -O0 -o main main.c hello.c -I./include
```

The option `-g3` adds the debugging information of marcos in your code.
If you do not have or do not care about debugging marcos, using `-g` is just fine.

The option `-O0` is used to disable any optimization that might cause surprises while debugging.

### A tour of `gdb` commands

Let's debug the executable `main`:

``` bash
gdb ./main
```

A list of frequently used GDB commands:

* `list`: List the source code.
* `run`: Run the program.
    - `run arg1 arg2 ...` to pass arguments.
* `break`: Set a breakpoint.
    - `break main.c:n` to set a breakpoint at line `n` of `main.c`.
    - `break function_name` to set a breakpoint at the function `function_name`.
* `condition`: Set a breakpoint condition.
    - `condition n variable=m` to let breakpoint `n` to be hit only if `variable` is `m`.
* `print`: Print value.
    - `print variable` to print the value of `variable`.
    - `print expression` to print the value of an expression.
    - `print $rax/$eax` to print the value in register `rax` or `eax`.
* `step`: Step into the next line.
* `stepi`: Step into the next instruction.
* `finish`: Step out of the current function.
* `next`: Step over the next line.
* `reverse-step/next/finish`: Step/next/finish backwards.
* `continue`: Continue to run the program.
* `backtrace`: Print the stack frame.
* `info`: Print information about the program.
    - `info breakpoints`: Print the breakpoints.
    - `info registers`: Print all registers.
* `show`: Print information about the debugger.
    - `show args`: Print the arguments passed to the program.

GDB also supports a text base UI, called TUI mode:

* `Ctrl-x a`: Switch on/off the TUI mode.
* `Ctrl-x 1`: Use a layout with only one window (source or assembly).
* `Ctrl-x 2`: Use a layout with at least two windows (two from source, assembly, register).
* `layout next/prev/name`: Switch to the next/previous layout, or the layout `name`.
* `Ctrl-x o`: Switch focus between windows.
* `Ctrl-x s`: Toggle the [single key mode][single-key-mode].

### Use `gdb` in VS Code

Added a section to setup VS Code debugging experience in the post [`Linux kernel overview`][kernel-overview].

### How a debugger works

Internally, the debugger uses the system call [`ptrace()`][ptrace] to
'control the execution of another process (the "tracee"), and examine and change the tracee's memory and registers'.

Briefly speaking, the debugger:

1. Call `fork()` to create a child process;
2. In the child process, call `ptrace()` with argument `PTRACE_TRACEME`.
This lets the OS to stop the child process whenever it receives a signal (except `SIGKILL`),
and notify the parent process via `wait()`.
3. Then the child process uses the `exec()` system call to load the tracee program.
The `PTRACE_TRACEME` argument causes the child process to send to itself a `SIGTRAP` whenever an `exec()` is called,
thus the child process stops here, and the parent gets notified.
4. In the parent process, it can wait on the `wait()` call in a dead loop, and take actions whenever the child stops.
For example it can `ptrace()` the child process with `PTRACE_SINGLESTEP` to let the it run one instruction then stop,
or use `PTRACE_CONT` to let the child process continue to run.
5. The parent process can also use `ptrace()` to peek and poke the child process.
For example it can use `PTRACE_POKETEXT` to replace the first byte of any instruction with the `INT 3` instruction,
and let the child program to stop on that instruction.
It can also recover the instruction back, then use `PTRACE_SETREGS` to step back the `eip` or `rip` by one,
and then restart the child process.
This is basically how a breakpoint is implemented.

To understand more details and play with `ptrace()` in an example,
I recommend to read the articles [How debugger works][debugger-eli] by Eli Bendersky.

## References

* [Tutorials][proe-s-weiss] by Professor S. Weiss from the City University of New York.
* Official manual [Debugging with GDB][fish-manual].
* [LLVM for Grad Students][llvm-for-grad] by Adrian Sampson.
* [How debugger works][debugger-eli] by Eli Bendersky.
* [Playing with ptrace][ptrace-tutorial] by Pradeep Padala.
* [How debugger works][debugger-alex] by Alexander Sandler.


[gcc]:                      https://gcc.gnu.org/
[gdb]:                      https://www.sourceware.org/gdb/
[RMS]:                      https://stallman.org/
[gnu-os]:                   https://www.gnu.org/home.en.html
[elf]:                      https://man7.org/linux/man-pages/man5/elf.5.html
[man-ld]:                   https://linux.die.net/man/1/ld
[man-readelf]:              https://man7.org/linux/man-pages/man1/readelf.1.html
[man-objdump]:              https://man7.org/linux/man-pages/man1/objdump.1.html
[gcc-lexer]:                https://gcc.gnu.org/onlinedocs/cppinternals/Lexer.html
[gcc-parser]:               https://gcc.gnu.org/wiki/New_C_Parser
[gcc-tiny]:                 https://thinkingeek.com/gcc-tiny/
[llvm]:                     https://llvm.org/
[llvm-tutorial]:            https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html
[elf-article]:              https://lwn.net/Articles/631631/
[dwarf]:                    https://dwarfstd.org/
[single-key-mode]:          https://sourceware.org/gdb/onlinedocs/gdb/TUI-Single-Key-Mode.html#TUI-Single-Key-Mode
[kernel-overview]:          /linux/2021/12/09/kernel-overview/
[ptrace]:                   https://man7.org/linux/man-pages/man2/ptrace.2.html
[debugger-eli]:             https://eli.thegreenplace.net/2011/01/23/how-debuggers-work-part-1
[proe-s-weiss]:             http://www.compsci.hunter.cuny.edu/~sweiss/resources.php
[fish-manual]:              https://sourceware.org/gdb/current/onlinedocs/gdb/index.html
[llvm-for-grad]:            https://www.cs.cornell.edu/~asampson/blog/llvm.html
[ptrace-tutorial]:          https://www.linuxjournal.com/article/6100
[debugger-alex]:            http://www.alexonlinux.com/how-debugger-works
