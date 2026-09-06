---
title: Asymptotic notations
date: 2026-09-06 20:04:20 -0300
url: /mathematics/2026/09/06/asymptotic-notations/
categories:
- mathematics
math: true
---

Asymptotic notations describe how the running time of an algorithm grows when the input size increases.
They let us compare algorithms without depending on a specific machine or environment.

<!--more-->

## Common growth functions

Here are some common growth functions, ordered roughly from slower to faster growth:

- Logarithmic: $\log n$
- Linear: $an + b$, simplified to $n$
- Quadratic: $an^2 + bn + c$, simplified to $n^2$
- Polynomial: $a_z n^z + \cdots + a_1 n + a_0$, simplified to $n^z$ where $z$ is a constant
- Exponential: $a^n$, where $a > 1$ is a constant

When we use an asymptotic notation, we ignore constant factors and lower-order terms.
For example, $3n^2 + 2n + 1$ has the same asymptotic growth as $n^2$.

## Big-O

Big-O gives an asymptotic upper bound.
We say that $f(n)$ is $O(g(n))$ if there are constants $c > 0$ and $n_0 > 0$ such that

$$
f(n) \leq c g(n)
$$

for every $n \geq n_0$.

For example, $3n^2 + 2n + 1$ is $O(n^2)$.

Big-O is often used to describe worst-case running time, but the notation itself does not mean "worst case".
Best, worst, and average cases describe which inputs we analyze.
Big-O describes an upper bound on the function from that analysis.

## Big-Omega

Big-Omega gives an asymptotic lower bound.
We say that $f(n)$ is $\Omega(g(n))$ if there are constants $c > 0$ and $n_0 > 0$ such that

$$
f(n) \geq c g(n)
$$

for every $n \geq n_0$.

Big-Omega is sometimes used when discussing best-case running time, but it can describe a lower bound for any case.

## Big-Theta

Big-Theta gives a tight asymptotic bound.
We say that $f(n)$ is $\Theta(g(n))$ if there are constants $c_1 > 0$, $c_2 > 0$, and $n_0 > 0$ such that

$$
c_1 g(n) \leq f(n) \leq c_2 g(n)
$$

for every $n \geq n_0$.

If $f(n)$ is $\Theta(g(n))$, then it is both $O(g(n))$ and $\Omega(g(n))$.
For example, $3n^2 + 2n + 1$ is $\Theta(n^2)$.

## Small-o

Small-o gives a strict asymptotic upper bound.
We say that $f(n)$ is $o(g(n))$ if, for every constant $c > 0$, there is an $n_0 > 0$ such that

$$
f(n) < c g(n)
$$

for every $n \geq n_0$.

In other words, $f(n)$ grows strictly slower than $g(n)$.
For example, $n$ is $o(n^2)$.

## Small-omega

Small-omega gives a strict asymptotic lower bound.
We say that $f(n)$ is $\omega(g(n))$ if, for every constant $c > 0$, there is an $n_0 > 0$ such that

$$
f(n) > c g(n)
$$

for every $n \geq n_0$.

In other words, $f(n)$ grows strictly faster than $g(n)$.
For example, $n^2$ is $\omega(n)$.
