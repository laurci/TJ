# TJ

TJ is a minimal JVM written in Typescript.

It implements a total of 3 opcodes. It can run hello world, but that's about it.

## Building and running

1. `yarn` to install dependencies
2. `yarn build` to build the project
3. `yarn start` will start the vm and load `test/HelloWorld.class`.

If you modify the Java sourcecode, you must run `javac` to recompile.
