# fix-ie-css-limit

### The Crux of the Matter

The script fixes the [well-known problem](http://support.microsoft.com/kb/262161/en-us) in IE6-9, when a number of cascading style sheets per document exceeds 31. What the script in fact does is

1. check for a number _N_ of style sheets in a document. If _N_ < _Ň_ (where _Ň_ is a "critical" count; details below), just return without doing anything else;
2. if _N_ >= _Ň_, collect all the external style sheets paths;
3. attach all the collected style sheets via the `@import` directive within several external style sheets;
4. remove the rest unused `<link>` tags.

In the above algorithm, _Ň_ stands for a "critical" number of style sheets. It is used by the script to determine whether or not to process. By default, processing starts when _N_ >= 31, but you may customize this value as described in the below section. As a result of the algorithm execution, the number of `<link>` tags decreases up to 15 times. Default number of `@import` directives per CSS file the script uses is 15, but you may set it to 31 (by maximum), which allows you to reduce the number of `<link>` tags even more. Though this seems to be rarely necessary.

### Why & How to Use

The most appropriate way to solve the problem with IE limitation on a number of CSS files is use server-side CSS file aggregation. But sometimes this solution may be either out-of-reach or undesirable by architecture reasons. It is also difficult to control manually the number of CSS files on each page of a large and complex website. So, such a script may appear to be a fast and simple solution of the annoying problem with IE.

To apply this solution just attach the script in the `HEAD` section of the document _after_ all the `<link>` elements. The script is of course IE-only, it does nothing in other browsers, but nevertheless you may use conditional comments to prevent other browsers even from trying to load the script.

```html
    <head>
        <link type="text/css" rel="stylesheet" href="style1.css" />
        <link type="text/css" rel="stylesheet" href="style2.css" />
        ...
        <link type="text/css" rel="stylesheet" href="style31.css" />
        <link type="text/css" rel="stylesheet" href="style32.css" />
        ...
        <!--[if IE]>
        <script type="text/javascript" src="fix-ie-css-limit/fix-ie-css-limit.min.js"></script>
        <![endif]-->
    </head>
```

There are two versions of fix-ie-css-limit: [standalone](https://github.com/Amphiluke/pure-js/tree/master/src/fix-ie-css-limit) and [jQuery based](https://github.com/Amphiluke/jquery-plugins/tree/master/src/fix-ie-css-limit).

Sometimes it's appear to be a good idea to execute the fix-ie-css-limit script even if the number of _statically_ attached style sheets doesn't exceed 31 (e.g. some graphic modules may _dynamically_ create style sheets, see also [this issue](https://github.com/Amphiluke/jquery-plugins/issues/1)). You may override the default execution criterion _Ň_ by assigning the desired "critical" number as in examples below:

```javascript
    // for jQuery based version:
    $.cssFixCountIE = 29;
```

```javascript
    // for standalone version:
    window.cssFixCountIE = 29;
```

Of course, this should be done _before_ fix-ie-css-limit executes. After the fix-ie-css-limit script finishes, the property `cssFixCountIE` may be safely deleted if need be: `delete window.cssFixCountIE;`.

### Live demo

[Here](http://amphiluke.github.io/pure-js/fix-ie-css-limit/), you may find a demo page using the fix-ie-css-limit (test it with IE versions older than 10).
