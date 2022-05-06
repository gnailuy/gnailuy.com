---
layout: post
title: "A tour to common build tools"
date: 2022-04-30 23:18:45 +0800
categories: [ linux ]
---

An introductory tour to the [`GNU Make`][make], [`GNU Autotools`][autotools], [`CMake`][cmake] build tools.

<!-- more -->

# Build tools

Build tools are around to help organize and optimize the build process for our projects.

There are tons of build tools available.
Java/Scala programmers usually use the [`Apache Maven`][maven], [`Gradle`][gradle], or the [`SBT`][sbt],
Golang programmers have the official [`go`][gocmd] command,
while Rust has their powerful [`Cargo`][cargo] tools.

For C/C++ projects, there are also many build tools available.
Although `Make` is designed as a more general purpose tool
"which controls the generation of executables and other non-source files of a program from the program's source files",
it is the most used build tool for C/C++ projects.
It uses a `Makefile` to store the build information for your project, and provides a `make` command to run the build.

The `Autotools` is a set of build tools that standardize the build procedure for C/C++ project.
With `Autotools`, most projects can be built and installed with the below commands:

``` bash
./configure
make
make install
```

As you can see from the above commands, `Make` is actually part of the `Autotools`.

`CMake` is another cool build tool we will talk about in this tour.
It uses a platform and compiler independent configuration file to generate build files on different systems.
Mostly is it used to generate `Makefile`s, but it can also support other build systems such as
Visual Studio, XCode, or [`Ninja`][ninja].

There are also other modern build tools for you to consider when creating a new project,
such as [`Bazel`][bazel], [`Ninja`][ninja], etc..

## Make

### What does `Make` do

`Make` uses a `Makefile` to store the build information for your project,
so that you do not need to re-type the complex build command each time you make a change.
It also benefits the end users when you distribute your software by source code,
they can easily build your software using simple `make` commands without knowing any compiler flag you use.

Another thing make does is that it calculates which files are already up-to-date,
so that it only recompile the files you modified or the files depends on the modified objects.
You do not need to recompile the whole project when you only change a few source files.

### Make rule

A `Makefile` contains a set of rules, and each rule describes how to execute a set of commands to build a `target`.
Below is what a simple rule looks like.
The `dependencies` list could be either source code files or other `target` files.
To build the `target`, make will check the dependencies list and make sure they exist, then run the `commands`.
If `target` exists and is newer than all its dependencies, make will not regenerate it.

``` make
target: dependencies ...
	commands
	...
```

### Tour

#### Build a simple main program

File: `hello.c`

``` c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("Hello World!\n");

    return 0;
}
```

File: `Makefile`

``` make
hello: hello.c
	gcc -o hello hello.c
```

1. Run command `make` to build the executable `hello`.
2. Run `make` again, it will skip the build as `hello` is already update-to-date.
3. Make some modification to `hello.c`, and `make` again.

#### Add a function file

File: `hello_func.h`

``` c
void say_hello(char* input);
```

File: `hello_func.c`

``` c
#include <stdio.h>

void say_hello(char* input) {
    printf("Hello %s!\n", input);
}
```

Update the main program to use `hello_func.c`:

File: `hello.c`

``` c
#include <hello_func.h>

int main(int argc, char *argv[]) {
    say_hello("World");

    return 0;
}
```

File: `Makefile`

``` make
hello: hello.c hello_func.o
	gcc -o hello hello.c hello_func.o -I.

hello_func.o: hello_func.c
	gcc -c -o hello_func.o hello_func.c

.PHONY: clean
clean:
	-rm -f hello hello_func.o
```

#### Implicit rule

The second rule generates `hello_func.o` from `hello_func.c`.
This is so common that `make` provides automatic rules for it, which are called implicit rules.
We can delete the second rule in our makefile to let make do the job automatically.

``` make
hello: hello.c hello_func.o
	gcc -o hello hello.c hello_func.o -I.

.PHONY: clean
clean:
	-rm -f hello hello_func.o
```

Run `make clean` and `make`, it generates the below logs:

``` text
cc    -c -o hello_func.o hello_func.c
gcc -o hello hello.c hello_func.o -I.
```

We can see that the implicit rule uses `cc` to compile `hello_func.c` to `hello_func.o`.
In many systems such as my Ubuntu desktop, `cc` is linked to `gcc`. So no problem, we are using the same compiler.
But to avoid potential issues, we can use make's variable ability to specify a compiler.

#### Use variables

File: `Makefile`

``` make
CC=gcc
CFLAGS=-I.

OBJS=hello.o hello_func.o

hello: $(OBJS)
	$(CC) -o hello $(OBJS) $(CFLAGS)

.PHONY: clean
clean:
	-rm -f hello $(OBJS)
```

Note how we define an `OBJS` variable to store all object files, and use them as the dependencies of target `hello`.
Implicit rules will apply automatically to generate these object files from the source files.

#### Build-in functions and automatic variables

We could update our project structure to organize different types of files in their own folders.
For example, we could have all the source code in a `src` folder, head files in a `include` folder.
We can also put the object files into a `obj` folder, and we might have pre-built libraries in the `lib` folder.

Let's update the project folder structure:

``` text
.
├── include
│   └── hello_func.h
├── lib
├── Makefile
├── obj
└── src
    ├── hello.c
    └── hello_func.c
```

And update the `Makefile` to:

``` make
DIR_INCLUDE=./include
DIR_LIBRARY=./lib
DIR_OBJECT=./obj
DIR_SOURCE=./src

CC=gcc
CFLAGS=-I$(DIR_INCLUDE)

_OBJS=hello.o hello_func.o
OBJS=$(patsubst %,$(DIR_OBJECT)/%,$(_OBJS))

hello: $(OBJS)
	$(CC) -o $@ $^ $(CFLAGS)

$(DIR_OBJECT)/%.o: $(DIR_SOURCE)/%.c
	$(CC) -c -o $@ $< $(CFLAGS)

.PHONY: clean
clean:
	-rm -f hello $(OBJS)
```

1. `pathsubst` is a build-in text function that substitutes all `%` to `$(DIR_OBJECT)/%`, in which `%` is the object file in the list of `$(_OBJS)` split by space.
2. When a rule contains more than one targets, it runs the command set once for each target.
3. `$@` is a build-in variable which means the target name, so in each run it echos the current target name.
4. `$^` means all the dependencies, while `$<` means the first item in the dependencies.

#### Practice

1. We've been ignoring the `hello_func.h` file in the dependencies list. Add it to the `Makefile`.
2. Add a static library file to the `lib` folder.
3. Use `-lm` to build a function that uses the `math` library.

#### More about make

* Reference to other build-in text functions: [Link][textfunctions].
* Reference to other automatic variables: [Link][automaticvariables].
* Reference: [Makefile Tutorial][makefiletutorial].
* Reference: [GNU make][makedoc].

## Autotools

### What does `Autotools` do

`Autotools` is part of the [GNU toolchain][toolchain].
It is a build system that helps in "making source code package portable to many Unix-like systems".
It is mostly used to standardize the build procedure for C/C++ project, but is not limited to C/C++.

`Autotools` consists three main components: `Autoconf`, `Automake`, and [`Libtool`][libtool].
In this section, we will cover the basic usage of `Autoconf` and `Automake`,
which generates a `configure` script to check the build environment,
and eventually generate a `Makefile` to build the project.

### Tour

#### Project structure

Let's have the below project structure, in which the `hello_func` is a module that has its own folder.

``` text
.
├── hello_func
│   ├── hello_func.c
│   └── hello_func.h
└── src
    └── hello.c
```

File: `hello.c`

``` c
#include <hello_func/hello_func.h>

int main(int argc, char *argv[]) {
    say_hello("World");

    return 0;
}
```

File: `hello_func.c`

``` c
#include <stdio.h>

void say_hello(char* input) {
    printf("Hello %s!\n", input);
}
```

File: `hello_func.h`

``` c
void say_hello(char* input);
```

We can use the below `gcc` command to build it:

``` bash
gcc -o hello src/hello.c hello_func/hello_func.c -I.
```

Let's use `Autoconf` to build the above project.

#### The `configure.ac` file

First, we need a `configure.ac` file, which is used to create the `configure` script.
`configure.ac` uses a language called [`M4sh`][m4sh],
which is based on the [`M4 Macro`][gnum4] language and the `sh` scripting language.
`M4sh` macros translates directly into `sh` syntax, you can reference [the document][m4sh] to understand the macros.

For a basic starter project, we need to below macros in the `configure.ac`.

File: `configure.ac`

``` bash
AC_INIT([hello], [0.0.1], [hello@example.com])
AM_INIT_AUTOMAKE([foreign subdir-objects -Wall -Werror])

AC_PROG_CC

AC_CONFIG_FILES([Makefile])
AC_OUTPUT
```

In the [`AC_INIT`][acinit] macro, we specify the program name, version, and bug report email.
There are also optional parameters `tarname` and `url`.

The [`AM_INIT_AUTOMAKE`][aminitautomake] macro is used to run other macros to generate proper operation in the final `Makefile`.
We use the `foreign` parameter to disable the default `gnu` project settings,
which requires a number of standard files in the top-level directory,
such as `NEWS`, `COPYING`, `AUTHORS`, `ChangeLog`, `README`.

Another parameter `subdir-objects` allow us to compile source files in sub-directories,
which helps to achieve [non-recursive make][nonrecursive].

We use `AC_PROG_CC` because we are creating a C project, and this macro will help check and use the `gcc` compiler.

The `AC_CONFIG_FILES` macro makes `AC_OUTPUT` to create `Makefile` from `Makefile.in`.
Thus in our configuration, the `configure` script we generate will create one `Makefile` in the root directory.

#### The `Makefile.am` file

We will need another file to help generate the final `Makefile`, which is `Makefile.am`.

`Makefile.am` is used by `Automake` to generate `Makefile.in`,
which then is used as the input template for `configure` script to generate the final `Makefile`.

Let's define our `Makefile.am` first:

``` make
bin_PROGRAMS = hello
hello_SOURCES = \
	src/hello.c \
	hello_func/hello_func.c
```

`Makefile.am` uses the same syntax as in a regular `Makefile`.
Usually a `Makefile.am` looks like ours and just contains a bunch of special variables.
`Automake` will generate certain rules according to these variables.
But you can also put other variables or rules to `Makefile.am`, and they will be copied to the `Makefile.in` as is.

In our example, the `bin_PROGRAMS` variable tells `Automake` that
we are going to generate the final executable as `hello` in the root directory.

Then the `hello_SOURCES` variable lists the required source code files by the `hello` target.
We do not need to list the header file `hello_func.h` because `Automake` will generate a `-I.` option for the final compile command.

#### Build and publish project

We now can build and publish our project using `Autotools` easily.

First, run:

``` bash
autoreconf --install
```

This command will automatically invoke `autoconf` and `automake` to generate the `configure` script and `Makefile.in`.
With the `--install` parameter, it also installs the helper scripts to process `configure.ac` and `Makefile.am`.

Note: Before the first time you run `autoreconf`, you may need to run command `aclocal` to generate the `M4sh` macros first.

Then we can run the well known `configure` script to generate the `Makefile`:

``` bash
./configure
```

In the generated `Makefile`, there will be a lot of standard rules we can use.

We use `make` to build the project:

``` bash
make
```

Then install/uninstall the program to/from your system:

``` bash
sudo make install
sudo make uninstall
```

Or make a tarball to publish your source code.

``` bash
make dist
```

Check out the `hello-0.0.1.tar.gz` you just generated.

#### Use a library in the project

Let's add a library in our project. We will use the standard `Math` library in our code,
it is installed by default in the `build-essential` package on Ubuntu.

First, update our code:

File: `hello_func.c`:

``` c
#include <math.h>
#include <stdio.h>

void say_hello(char* input) {
    printf("Hello %s!\n", input);

    double result = sin(M_PI/2);
    printf("sin(PI/2) is %lf\n", result);
}
```

We uses the `sin()` function and the `M_PI` value from the Math library.
And thus we need the `-lm` flag for `gcc` to link it.

File: `Makefile.am`

``` make
bin_PROGRAMS = hello
hello_SOURCES = \
	src/hello.c \
	hello_func/hello_func.c
hello_LDFLAGS = -lm
```

And finally, we can check if the library exists before we build our project:

File: `configure.ac`

``` bash
AC_INIT([hello], [0.0.1], [hello@example.com])
AM_INIT_AUTOMAKE([foreign subdir-objects -Wall -Werror])

AC_PROG_CC
AC_CONFIG_FILES([Makefile])

AC_CHECK_LIB(m, main, [], [
    echo "Error! \
        Math library is required. \
        Please install it to build this project."
    exit -1
])

AC_OUTPUT
```

We added a `AC_CHECK_LIB` macro, to check if the `main` symbol exists in the `m` library.
The third and forth parameter of `AC_CHECK_LIB` defines the action if the check returns true or false.
Thus we use the forth parameter to give user a hint if the library does not exist,
and quit the `configure` script with error.

#### Practice

1. We also ignored the `hello_func.h` file in the final tarball, try add it to the project.
2. Add `Libtool` to your project. Use `lib_LTLIBRARIES=mylib.la` and `mylib_la_SOURCES=mylib.c` to add a static library.
3. Use the [`GNU GSL`][gsl] library in your project. Check its existence in the `configure.ac` script, and link it in your `Makefile.am`.

### More about autotools

* Reference: [GNU Build System][buildsystem]
* Reference: [Autotools Tutorial][autotoolstutorial]
* Reference: [Autotools Mythbuster][mythbuster]

## CMake

### Overview

`CMake` is another popular build tool for C/C++ projects.
Like the `Autotools`, it can generate `Makefile`s for your project on different environments.
But it can also generate other workspaces such as Visual Studio projects, XCode projects.
It is a powerful, popular cross-platform build tool.

### Tour

#### Simple project

Let's have a single source C project first.

File: `hello.c`

``` c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("Hello World!\n");

    return 0;
}
```

`CMake` configures the build information in a file named `CMakeLists.txt`.
Inside the `CMakeLists.txt`, we call different build-in commands to control the build system behavior.
A simple `CMakeLists.txt` for our project could be:

File: `CMakeLists.txt`

``` cmake
cmake_minimum_required(VERSION 3.10)

project(hello)

add_executable(hello hello.c)
```

That's it. We can now build our project by:

``` bash
mkdir build
cd build
cmake ../
cmake --build .
```

The first `cmake` command generates native build files for our system, which is a `Makefile` in our case.
Then the second `cmake` command invokes our native build system to actually compile the code and build the executable.
In this small project, you can also type `make` to build the project, using the generated `Makefile`.

You can find the build result `hello` in the `build` folder.

#### Print version

Next we add a version number to the project, and add it to a configure header file,
so that we can use the project file `CMakeLists.txt` to control the code behavior.

First, we add the version number to the `project` command.

``` cmake
project(hello VERSION 0.0.1)
```

Then we add a `version.h.in` header file template, which will be used to generate a correct `version.h`.

File: `version.h.in`

``` c
#define VERSION @hello_VERSION@
#define VERSION_MAJOR @hello_VERSION_MAJOR@
#define VERSION_MINOR @hello_VERSION_MINOR@
#define VERSION_PATCH @hello_VERSION_PATCH@
#define VERSION_TWEAK @hello_VERSION_TWEAK@
```

The `configure_file` command is used to generate `version.h` from `version.h.in`:

``` cmake
configure_file(version.h.in version.h)
```

It will use the [extracted version numbers][projectversion] from the `project` command to replace strings
in the `version.h.in` file like `@hello_VERSION_MAJOR`.

Then we can use the information in the `version.h` header file to print the version numbers.

File: `hello.c`

``` c
#include <stdio.h>
#include <version.h>

int main(int argc, char* argv[]) {
    printf("hello program version %d.%d.%d\n",
        VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH);

    return 0;
}
```

Finally, we add the project folder that contains the header files to the `include` search path,
the final `CMakeLists.txt` looks like:

File: `CMakeLists.txt`

``` cmake
cmake_minimum_required(VERSION 3.10)

project(hello VERSION 0.0.1)

configure_file(version.h.in version.h)

add_executable(hello hello.c)

target_include_directories(hello PUBLIC "${PROJECT_BINARY_DIR}")
```

Run the `cmake` command from the `build` folder:

``` bash
cmake ../
```

Check out the generate `version.h` file, and see how version numbers are broken down into different macros.

Then run command:

``` bash
cmake --build .
./hello
```

To build the executable `hello`, and use it to print the version number defined in the `CMakeLists.txt` file.

#### Add a library

Let's add our `hello_func` library into this project.
Create a `hello_func` directory in the project root and add the below two files.

File: `hello_func.c`

``` c
#include <stdio.h>

void say_hello(char* input) {
    printf("Hello %s!\n", input);
}
```

File: `hello_func.h`

``` c
void say_hello(char* input);
```

Then, we add a `CMakeLists.txt` file in the `hello_func` folder for our library code:

File: `hello_func/CMakeLists.txt`

``` cmake
add_library(hello_func hello_func.c)

target_include_directories(hello_func INTERFACE ${CMAKE_CURRENT_SOURCE_DIR})
```

This will build `hello_func.c` into a static library.
The second command uses the `INTERFACE` [usage requirement][usagerequirement]
to let anybody linking to the library to include its source directory.

To use our library, we need to add it to the main `CMakeLists.txt`:

File: `CMakeLists.txt`

``` cmake
cmake_minimum_required(VERSION 3.10)

project(hello VERSION 0.0.1)

configure_file(version.h.in version.h)

add_subdirectory(hello_func)
list(APPEND EXTRA_LIBS hello_func)

add_executable(hello hello.c)

target_link_libraries(hello PUBLIC ${EXTRA_LIBS})

target_include_directories(hello PUBLIC "${PROJECT_BINARY_DIR}")
```

We use the `add_subdirectory` command to let `cmake` build the library code in the folder `hello_func`.
Then we add the library name `hello_func` to the `EXTRA_LIBS` variable,
and add the `EXTRA_LIBS` to the build command by using the `target_link_libraries` command.

Finally, we modify the main program to use the library we just added:

File: `hello.c`

``` c
#include <hello_func.h>
#include <stdio.h>
#include <version.h>

int main(int argc, char* argv[]) {
    printf("hello program version %d.%d.%d\n",
        VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH);

    say_hello("World");

    return 0;
}
```

Build the project with `cmake ../` and `cmake --build .`, and check out the generated static library `libhello_func.a`.

#### Install the software

`CMake` also support a `cmake --install .` command.
To use it to install our software, we need to tell the `CMakeLists.txt` file which file installs to which destination.

First, we install our library and its header file.

File: `hello_func/CMakeLists.txt`

``` cmake
add_library(hello_func hello_func.c)

target_include_directories(hello_func INTERFACE ${CMAKE_CURRENT_SOURCE_DIR})

install(TARGETS hello_func DESTINATION lib)
install(FILES hello_func.h DESTINATION include)
```

Then we install the main program to the bin folder:

File: `CMakeLists.txt`

``` cmake
cmake_minimum_required(VERSION 3.10)

project(hello VERSION 0.0.1)

configure_file(version.h.in version.h)

add_subdirectory(hello_func)
list(APPEND EXTRA_LIBS hello_func)

add_executable(hello hello.c)

target_link_libraries(hello PUBLIC ${EXTRA_LIBS})

target_include_directories(hello PUBLIC "${PROJECT_BINARY_DIR}")

install(TARGETS hello DESTINATION bin)
install(FILES "${PROJECT_BINARY_DIR}/version.h" DESTINATION include)
```

The `install` command is pretty self-explanatory, we can use the below command to test the installation:

``` bash
cmake --install . --prefix /some/test/path/
```

### Practice

1. Add another library `math_func` that uses the Math library to calculate `sin(M_PI/2)`. Hint: `target_link_libraries(math_func m)`.
2. Define an [`option`][cmakeoption] in your project, and use it to make `math_func` optional in the main program.

### More about CMake

* Reference: [CMake Documentation][cmakedoc]
* Reference: [Use `CMake` build system with `Conan` package manager][conan]


[make]:                         https://www.gnu.org/software/make/
[autotools]:                    https://www.gnu.org/software/automake/manual/html_node/Autotools-Introduction.html
[cmake]:                        https://cmake.org/
[maven]:                        https://maven.apache.org/
[gradle]:                       https://gradle.org/
[sbt]:                          https://www.scala-sbt.org/
[gocmd]:                        https://pkg.go.dev/cmd/go
[cargo]:                        https://www.rust-lang.org/tools
[bazel]:                        https://bazel.build/
[ninja]:                        https://ninja-build.org/
[textfunctions]:                https://www.gnu.org/software/make/manual/html_node/Text-Functions.html
[automaticvariables]:           https://www.gnu.org/software/make/manual/html_node/Automatic-Variables.html
[makefiletutorial]:             https://makefiletutorial.com/
[makedoc]:                      https://www.gnu.org/software/make/manual/html_node/index.html
[toolchain]:                    https://en.wikipedia.org/wiki/GNU_toolchain
[libtool]:                      https://www.gnu.org/software/libtool/
[m4sh]:                         https://www.gnu.org/software/autoconf/manual/autoconf-2.60/html_node/Programming-in-M4sh.html
[gnum4]:                        https://www.gnu.org/software/m4/manual/m4.html
[acinit]:                       https://www.gnu.org/software/autoconf/manual/autoconf-2.67/html_node/Initializing-configure.html
[aminitautomake]:               https://www.gnu.org/software/automake/manual/html_node/Public-Macros.html
[gsl]:                          http://gnu.ist.utl.pt/software/gsl/manual/html_node/Autoconf-Macros.html
[nonrecursive]:                 https://autotools.info/automake/nonrecursive.html
[buildsystem]:                  https://www.gnu.org/software/automake/manual/html_node/GNU-Build-System.html
[autotoolstutorial]:            https://www.lrde.epita.fr/~adl/autotools.html
[mythbuster]:                   https://autotools.info/index.html
[projectversion]:               https://cmake.org/cmake/help/latest/variable/PROJECT-NAME_VERSION.html
[usagerequirement]:             https://cmake.org/cmake/help/latest/manual/cmake-buildsystem.7.html#include-directories-and-usage-requirements
[cmakeoption]:                  https://cmake.org/cmake/help/latest/command/option.html
[cmakedoc]:                     https://cmake.org/cmake/help/latest/index.html
[conan]:                        https://docs.conan.io/en/latest/getting_started.html
