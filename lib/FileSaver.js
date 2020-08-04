((a, b) => {
  if ('function' == typeof define && define.amd) define([], b);
  else if ('undefined' != typeof exports) b();
  else {
    b(), (a.FileSaver = { exports: {} }.exports);
  }
})(this, () => {
  function b(a, b) {
    return (
      'undefined' == typeof b
        ? (b = { autoBom: !1 })
        : 'object' != typeof b &&
          (console.warn('Depricated: Expected third argument to be a object'),
          (b = { autoBom: !b })),
      b.autoBom &&
      /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
        a.type
      )
        ? new Blob(['\uFEFF', a], { type: a.type })
        : a
    );
  }

  function c(b, c, d) {
    const e = new XMLHttpRequest();
    e.open('GET', b),
      (e.responseType = 'blob'),
      (e.onload = () => {
        a(e.response, c, d);
      }),
      (e.onerror = () => {
        console.error('could not download file');
      }),
      e.send();
  }

  function d(a) {
    const b = new XMLHttpRequest();
    return b.open('HEAD', a, !1), b.send(), 200 <= b.status && 299 >= b.status;
  }

  function e(a) {
    try {
      a.dispatchEvent(new MouseEvent('click'));
    } catch (c) {
      const b = document.createEvent('MouseEvents');
      b.initMouseEvent(
        'click',
        !0,
        !0,
        window,
        0,
        0,
        0,
        80,
        20,
        !1,
        !1,
        !1,
        !1,
        0,
        null
      ),
        a.dispatchEvent(b);
    }
  }

  const f =
    'object' == typeof window && window.window === window
      ? window
      : 'object' == typeof self && self.self === self
      ? self
      : 'object' == typeof global && global.global === global
      ? global
      : void 0;

  var a =
    f.saveAs ||
    ('object' != typeof window || window !== f
      ? () => {}
      : 'download' in HTMLAnchorElement.prototype
      ? (b, g, h) => {
          const i = f.URL || f.webkitURL,
            j = document.createElement('a');
          (g = g || b.name || 'download'),
            (j.download = g),
            (j.rel = 'noopener'),
            'string' == typeof b
              ? ((j.href = b),
                j.origin === location.origin
                  ? e(j)
                  : d(j.href)
                  ? c(b, g, h)
                  : e(j, (j.target = '_blank')))
              : ((j.href = i.createObjectURL(b)),
                setTimeout(() => {
                  i.revokeObjectURL(j.href);
                }, 4e4),
                setTimeout(() => {
                  e(j);
                }, 0));
        }
      : 'msSaveOrOpenBlob' in navigator
      ? (f, g, h) => {
          if (((g = g || f.name || 'download'), 'string' != typeof f))
            navigator.msSaveOrOpenBlob(b(f, h), g);
          else if (d(f)) c(f, g, h);
          else {
            const i = document.createElement('a');
            (i.href = f),
              (i.target = '_blank'),
              setTimeout(() => {
                e(i);
              });
          }
        }
      : (a, b, d, e) => {
          if (
            ((e = e || open('', '_blank')),
            e &&
              (e.document.title = e.document.body.innerText = 'downloading...'),
            'string' == typeof a)
          )
            return c(a, b, d);
          const g = 'application/octet-stream' === a.type,
            h = /constructor/i.test(f.HTMLElement) || f.safari,
            i = /CriOS\/[\d]+/.test(navigator.userAgent);
          if ((i || (g && h)) && 'object' == typeof FileReader) {
            const j = new FileReader();
            (j.onloadend = () => {
              let a = j.result;
              (a = i ? a : a.replace(/^data:[^;]*;/, 'data:attachment/file;')),
                e ? (e.location.href = a) : (location = a),
                (e = null);
            }),
              j.readAsDataURL(a);
          } else {
            const k = f.URL || f.webkitURL,
              l = k.createObjectURL(a);
            e ? (e.location = l) : (location.href = l),
              (e = null),
              setTimeout(() => {
                k.revokeObjectURL(l);
              }, 4e4);
          }
        });

  (f.saveAs = a.saveAs = a),
    'undefined' != typeof module && (module.exports = a);
});
