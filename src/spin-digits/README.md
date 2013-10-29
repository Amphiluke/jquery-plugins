# spin-digits

### The Crux of the Matter

The plugin applies flip animation to dynamically changing numeric data on the web-page. The current plugin version works only with floating point numbers, but there is a simple CSS trick allowing the use of the plugin to animate integers as well (see the [Examples](#examples) section below).

### Details & API

The main plugin method `.spinDigits()` has the following signature:

    <jQuery_object>.spinDigits([op[, data]]);

This method is used both for plugin initialization and for triggering animated value change. To firstly apply the plugin to a set of elements on the page, just call the method `.spinDigits()` without any parameters (or alternatively specify a single string `"init"` as the value for the `op` argument). When it is about time to change the value, call the same method `.spinDigits()` with two arguments: the first one is `"set"` (as an operation, the `op` argument) and the second is either a formatted value (e.g. `"$ 76 543.21"`) or a function returning such a value for each element in the set of matched elements. One more supported operation `op` is `"update"`; use it if you need to update the displayed value quickly, without animation.

The plugin additionally provides a selector `:spinned` which selects all elements that are in the progress of spinning at the time the selector is run. Note that the similar selector [`:animated`](http://api.jquery.com/animated-selector/) cannot be used instead, since the **spin-digits** plugin applies CSS3 transitions to perform animation (programmatic animation is applied only in browsers which lack support of CSS3 transitions).

### Examples

Consider the following simple HTML fragment:

```html
    <p class="spin-test">$&nbsp;12&nbsp;345.67</p>
```

The basic double-step usage of the **spin-digits** plugin involves firstly initialization

```javascript
    $(".spin-test").spinDigits("init"); // or simply $(".spin-test").spinDigits();
```

and secondly any number of triggers of animated value change

```javascript
    $(".spin-test").spinDigits("set", "$\xA076\xA0543.21"); // \xA0 => &nbsp;
    // ...
    $(".spin-test").spinDigits("set", "-$\xA01.23");
```

The modern browsers try to optimize the performance of a web-page, so they disable CSS3 animations if the page is not visible to the user (e.g. the browser window is minimized or the user is on another browser tab). Sometimes one needs a way to update quickly the displayed value without animation, say, when the page becomes visible. It is possible with using the `"update"` operation through the `.spinDigits()` method.

```javascript
    // Just an example… Some browsers still require vendor prefixes to work with Page Visibility API
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            $(".spin-test").spinDigits("update", actualValue);
        }
    }, false);
```

Sometimes it is useful to check whether or not the element is ready for the next animated value change. If the requests for value change can be too frequent, then, before you trigger the next change, use the `:spinned` selector to determine the status of the current animation in the element:

```javascript
    var spinTest = $(".spin-test");
    if (spinTest.find(":spinned").length === 0) {
        spinTest.spinDigits("set", "-$\xA076\xA0543.21");
    }
````

As mentioned above, the **spin-digits** plugin works with floating point numbers only. So, if you work with integers, and don't wish the fractional part to display, just add a CSS class `spin-digit-int` to your target container.

```html
    <p class="spin-test spin-digit-int">$&nbsp;12&nbsp;345.0</p>
```

What the class `spin-digit-int` in fact does is hide from view undesirable decimal point and the fractional part. Note however that the fractional part remains required by the plugin, so specify the decimal zero explicitly on setting the value

```javascript
    $(".spin-test.spin-digit-int").spinDigits("set", "$\xA03.0"); // pass explicit decimal zero for "integers"
```

### Demos

Checkout the test file [spin-digits-demo.html](https://github.com/Amphiluke/jquery-plugins/blob/master/tests/spin-digits/spin-digits-demo.html) to see the plugin in action.
