# WebGPU Dev Extension

This is an extension to do some experiments with WebGPU. At the moment it's
mostly for exploration but maybe someday it will morph into something useful.

## Options

* Show Errors

  This has 3 points

  1. A WebGPU app can suppress errors by capturing them with `pushErrorScope` and `popErrorScope`
     as well as adding an `uncapturederror` listener to the device. Turning on this feature
     still prints the errors to the JavaScript console, even when they are captured.

  2. WebGPU errors happen asynchronously and so often do not provide info where the
     error happened. This is an attempt to add that info for some (but not all) errors.

  3. The parameters of the function that caused the error are not always available.
     This is an attempt to include those parameters.

* Add View Description to View

  When you call `createView` on a texture you pass in a descriptor. That descriptor is
  not reflected in the view itself which can make it hard to see what's going on.
  This adds that data onto the view so you can inspect it in the debugger or in the
  error messages printed by "Show Errors"

* Force Mode

  Lets you choose one of `'none'`, `'low-power'`, `'high-performance'`, and `'compatibility-mode'`

* Dump Shaders

  Dumps the pages shaders

* Emulate Compat

  Experiment to show what places would fail in compatibility mode

* Count Active Devices

  Prints to the console the number of active WebGPU devices

* Capture

  Attempt to capture WebGPU calls to an HTML file using [webgpu_recorder](https://github.com/brendan-duncan/webgpu_recorder)

