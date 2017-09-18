class EventTargetStub {

  constructor() {
    this._listeners = new Map();
  }

  addEventListener(type, fn) {
    var set = this._listeners.get(type);
    if (!set) {
      set = new Set();
    }
    set.add(fn);
    this._listeners.set(type, set);
  }

  removeEventListener(type, fn) {
    var set = this._listeners.get(type);
    if (!set) {
      throw new Error('No events registered for type ' + type);
    }
    if (!set.has(fn)) {
      throw new Error('Event handler not registered for type ' + type);
    }
    set.delete(fn);
  }

  nofifyListeners(type, ...args) {
    var set = this._listeners.get(type);
    if (!set) {
      throw new Error('No events registered for type ' + type);
    }
    set.forEach(i => i.apply(this, args));
  }
}

class FileWriterStub extends EventTargetStub {
  constructor() {
    super();
    this.length = 10;
  }

  truncate(opt) {
    if (isNaN(opt)) {
      throw new Error('Argument is not a number (truncate)');
    }
    this.nofifyListeners('writeend');
  }

  seek(opt) {
    if (isNaN(opt)) {
      throw new Error('Argument is not a number (seek) ' + opt);
    }
  }

  write(data) {
    if (!(data instanceof Blob)) {
      throw new Error('Data to write is not a blob');
    }
    this.nofifyListeners('writeend');
  }
}

window.chrome = window.chrome || {};
window.chrome.runtime = window.chrome.runtime || {};
window.chrome.runtime.lastError = undefined;
window.chrome.fileSystem = window.chrome.fileSystem || {};

window.chrome.fileSystem.chooseEntry = function(opts, callback) {
  var obj = {
    createWriter: function(callback) {
      var obj = new FileWriterStub();
      callback(obj);
    }
  };
  callback(obj);
};
