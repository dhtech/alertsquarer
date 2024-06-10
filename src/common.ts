export const wait = async (ms: number): Promise<void> => await new Promise((resolve: () => void) => setTimeout(resolve, ms))

export const setupLog = () => {
    const originalLog = console.log
    // Overwriting
    console.log = function () {
      var args = [].slice.call(arguments);
      originalLog.apply(console.log,[getCurrentDateString()].concat(args));
    };
    // Returns current timestamp
    function getCurrentDateString() {
      return (new Date()).toISOString() + ' ::';
    };
  }