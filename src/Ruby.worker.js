import run from "./emscripten/ruby-2.6.3/miniruby.js";
import WASM from "./emscripten/ruby-2.6.3/miniruby.wasm";

const input = new Promise((resolve, reject) => {
  self.addEventListener('message', (msg) => {
    resolve(msg.data.input);
  });
});

// Configure the emscripten Module
const Module = {
  locateFile: function(path) {
    if (path.endsWith(".wasm")) {
      return WASM;
    }
    return path;
  },
  onExit: ((status) => {
    // exit() system call
    self.postMessage({complete: true, exitStatus: status.status});
  }),
  noInitialRun: true,
  noExitRuntime: false,

  stdin: function() {
    return null;
  },
  print: function(output) {
    self.postMessage({ fd: 1, output: output + "\n" });
  },
  printErr: function(output) {
    switch (output) {
    case "Calling stub instead of sigaction()":
      // ignore
      break;
      
    default:
      self.postMessage({ fd: 2, output: output + "\n" });
    }
  }
};

const GEMS = {
  // how to generate file list for a gem:
  // $ cd public/gems/xxx/lib
  // $ ruby -e 'pp Dir["**/*.rb"]'
  ostruct: ["ostruct.rb"],
  json: [
    "json.rb", "json/common.rb", "json/version.rb", "json/generic_object.rb",
    "json/pure/generator.rb", "json/pure/parser.rb",
    "json/pure.rb",
  ],
  kamiflex: [
    "kamiflex.rb", "kamiflex/railtie.rb", "kamiflex/actions.rb",
    "kamiflex/core.rb", "kamiflex/basic_elements.rb",
    "kamiflex/version.rb",
    "kamiflex/quick_reply.rb",
    "kamiflex/custom.rb",
  ],
}

// Initialize the module
run(Module).then(function() {
  // Module is ready to run
  // Wait until we have input
  input.then(async function(input) {
    // Write the input file
    Module.FS.writeFile(
      "playground.rb", `
        ${Object.keys(GEMS).map(gem => `$LOAD_PATH.push('/gems/${gem}/lib');`).join('\n')}
        ${input}
      `
    );

    await Promise.all(
      Object.entries(GEMS)
        .flatMap(([gem, rubies]) => rubies.map(rb => `/gems/${gem}/lib/${rb}`))
        .map(async f => {
          const rbScript = await (await fetch(f)).text();
          //console.log(rbScript)
          Module.FS.mkdirTree(f.split('/').slice(0, -1).join('/'))
          Module.FS.writeFile(f, rbScript);
        })
    );

    //console.log(JSON.stringify(Object.keys(Module.FS)))

    // Run main()
    Module.callMain(["playground.rb"]);
    //Module.callMain(["--help"]);

    // Indicate completion
    self.postMessage({complete: true});
  });
});
