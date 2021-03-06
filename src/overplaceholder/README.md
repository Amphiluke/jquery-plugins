# overplaceholder

### The Crux of the Matter

overplaceholder is a jQuery plugin designed to emulate placeholder functionality on such form elements as single- and multiline text fields, password fields and rarely selects and file inputs. The main difference between overplaceholder and other existing placeholder plugins is that the former does not change at all the `value` property of the target fields. It uses positioned label elements to simulate placeholder text. This allows overplaceholder to process password fields and even file inputs.

The other thing is that the purpose of the fields will keep clear even for users who disabled Javascript in their browsers (due to remaining static labels in HTML).

### Details & API

The plugin adds the only method to jQuery prototype object — `.overplaceholder()`. Use this method to activate the plugin functionality. The method should be called in context of a jQuery set of `<label>` elements.

```javascript
    $(".someform label[for]").overplaceholder();
```

Notice that the target labels should have explicitly set `for` attribute.

```html
    <!-- do not call overplaceholder for labels like this... -->
    <label><input type="text" /> Label text</label>

    <!-- ...whereas such a label will be processed correctly -->
    <input type="text" id="txt" /> <label for="txt">Label text</label>
```

The method `.overplaceholder()` takes an optional argument of object type which allows placeholder behavior customizing. You can set any of the following properties of the hash to pass into the method:

* `onhide` — a function implementing placeholder behavior at the moment when it should be moved away from the target field giving the way to an actual value. This function is called in context of a label DOM object, so `this` keyword points the label element.
* `onshow` — a function implementing placeholder behavior at the moment when it should be turned back to the target field and fill in for an empty field value. This function is called in context of a label DOM object, so `this` keyword points the label element.
* `reEmpty` — either a string or a pattern (regular expression) used to determine whether or not to display a placeholder when the target field looses the input focus. If the value of the field matches such a string or a regular expression at the moment the focus is moved away, the `value` property will be set to an empty string and a placeholder text will appear. Default value of the `reEmpty` parameter is `""` (an empty string) which means that by default overplaceholder will appear only when the field is strictly empty. The parameter may be useful when the default value of the target field is not an empty string for some reason (e.g. it is a `<select>` element generated by a CMS).
* `onafterWrap` — a callback function which is called just after the target field is wrapped with an accessory wrapper element and the label element is inserted into it. This callback function is rarely need to be specified, it may be used for example to restore some programmatically set attributes of the target field, if they tend to reset due to the wrapping procedure. This function takes two parameters — jQuery objects that correspond to the label element and it's target field. The property default value is `null`.

Alternatively, you may pass a function an an argument. In that case the function will be called for each element in the set of matched elements, and it should return a hash of options in the form described above. The `this` keyword within the function points the current `<label>` DOM element whose initialization options are expected from the function to be returned.

### Examples

* Minimum initialization with no animation effects on focus/blur events:
```javascript
    $("label[for]").overplaceholder();
```

* Animation of any type may be applied to a placeholder when the textfield is focused in and out:
```javascript
    $("label[for]").overplaceholder({
        onshow: function() { $(this).slideDown("slow"); },
        onhide: function() { $(this).fadeOut("fast"); }
    });
```

* Here is a way to point the overplaceholder to treat text fields (e.g. `<input>`, `<textarea>`) which contain only space symbols as they were empty.
```javascript
    $("label[for]").overplaceholder({ reEmpty: /\s/g });
```

* You may stylize placeholder as you wish using CSS and HTML markup.
```html
    <input type="text" name="captcha" id="captcha" /><br />
    <label for="captcha" style="background:url(protect-icon.png) 2px 50% no-repeat; padding-left:10px;">
        <del><em>Secret</em></del> <ins><strong>code</strong></ins>
    </label>
    <script type="text/javascript">
    $("label[for='captcha']").overplaceholder({
        onshow: function() { $(this).animate({ "width": "toggle" }); }
    });
    </script>
```

### Notes & tips

It is necessary to include the required CSS file `jquery.overplaceholder.css` to the `HEAD` section of the document for the overplaceholder to display correctly.

If you *programmatically* change the `value` property of some field the overplaceholder is attached to, no callbacks will be called automatically. This is because there is no so far a cross-browser way to detect programmatic field content change. Be sure to trigger a custom `"progvalchange"` event on the target field every time you alter its `value` property.

```javascript
    $(".some-textfield").val("Programmatically set value").triggerHandler("progvalchange");
```

This will let the plugin know that the value was changed and a placeholder visibility needs to be re-checked.

Note that attaching overplaceholder to *initially hidden* field may result in some mispositioning of the label relatively to the field. This is because of impossibility of calculation the sizes of hidden elements. So, one may need a way to correct overplaceholder position when the element becomes visible. Just trigger a custom event `"adjustPos"` on the mispositioned label element to adjust its position.

```javascript
    $("label[for='some-hidden-textfield']").overplaceholder();
    // ...
    $("#some-hidden-textfield").show();
    $("label[for='some-hidden-textfield']").triggerHandler("adjustPos");
```

Notice that overplaceholder is absolutely indifferent to any form validation, since it does not change input field content. So, you need not walk through all the fields and clear placeholder text before you invoke validation procedure.

### Live demos

You may find some demos of use the overplaceholder plugin [here](http://amphiluke.github.io/jquery-plugins/overplaceholder/).
