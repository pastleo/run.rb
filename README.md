# Run.rb

Run.rb is a tool to run Ruby code inside the browser.

This project **compiles Ruby to WebAssembly**. Inside `/src/emscripten` you'll find (currently) Ruby 2.6.0 and the tooling required to compile Ruby to WASM.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), but then we ejected it for WebAssembly reasons.

## Goals

- [x] Have an online interface to write and run Ruby code
- [ ] Include the Ruby Standard Library
- [ ] Add the ability to save "snippets" and share them
- [ ] Provide JS libraries for run.rb supported versions of Ruby
  - Something like: `<script src="https://runrb.io/ruby-2.6.1">` and `ruby("yourcode") // => Promise`
- [ ] You [tell us](https://github.com/jasoncharnes/run.rb/issues/new)

## Compiling Ruby to WASM

To compile Ruby into WebAssembly, you'll need [Docker](https://www.docker.com/products/docker-desktop) installed.

In the project directory, you can run: `make`

## Available scripts

To run the application locally, you'll need [NodeJS](http://nodejs.org) and [Yarn](http://yarnpkg.com) installed.

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

**We sure could use some tests. 😉**

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

---

## Trying to build

```dockerfile
#FROM trzeci/emscripten:sdk-tag-1.38.28-64bit
FROM emscripten/emsdk
RUN apt-get update && \
  apt-get install -y autoconf bison ruby less vim  && \
  apt-get clean

# Clone and patch Ruby
RUN git clone https://github.com/ruby/ruby.git --depth 1 --branch v2_6_1
#ADD ruby-2.6.1.patch /src
#WORKDIR /src/ruby
#RUN patch -p1 < /src/ruby-2.6.1.patch

# docker run --rm -it -v $(pwd):/src/pwd emcc bash

# Build miniruby bitcode
#RUN autoconf
#RUN emconfigure ./configure --disable-fiber-coroutine --disable-dln --with-ext=json
#RUN EMCC_CFLAGS='-s ERROR_ON_UNDEFINED_SYMBOLS=0 -r' emmake make miniruby.bc EXEEXT=.bc
#RUN emmake make miniruby.bc EXEEXT=.bc

# emcc: warning: generating an executable with an object extension (.so).  If you meant to build an object file please use `-c, `-r`, or `-shared` [-Wemcc]


# Build miniruby.wasm
#RUN mkdir web && emcc -o web/miniruby.js miniruby.bc \
  #-s ERROR_ON_UNDEFINED_SYMBOLS=0 \
  #-s TOTAL_MEMORY=67108864 \
  #-s EMULATE_FUNCTION_POINTER_CASTS=1 \
  #-s MODULARIZE=1 \
  #-s EXTRA_EXPORTED_RUNTIME_METHODS=['FS']
```

> but for now all attempts have failed

## ask existing `.wasm` to load gems

we need 3 gems:

* https://github.com/flori/json
* https://github.com/ruby/ostruct
* https://github.com/etrex/kamiflex

`git clone` them into `public/gems` and remove lines related to `parser` in `public/gems/json/lib/json/pure.rb`
