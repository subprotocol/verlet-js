// things that only need to run on subprotocol.com
if (window.location.host === "subprotocol.com") {
  (function() {
    var bsa;
    bsa = document.createElement("script");
    bsa.type = "text/javascript";
    bsa.async = true;
    bsa.src = "http://s3.buysellads.com/ac/bsa.js";
    return (document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(bsa);
  })();
  (function(i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    i[r] = i[r] || function() {
      return (i[r].q = i[r].q || []).push(arguments_);
    };
    i[r].l = 1 * new Date();
    a = s.createElement(o);
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    return m.parentNode.insertBefore(a, m);
  })(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
  ga("create", "UA-83795-7", "subprotocol.com");
  ga("send", "pageview");
}