# Remark code block

- [x] syntax highlighting with [refractor](https://github.com/wooorm/refractor) which uses [PrismJS](https://github.com/PrismJS/prism) under the hood.
- [x] support `filename` through [`meta` field](https://github.com/syntax-tree/mdast#code)

    <pre>
      ```js filename=hello-world.js
      console.log(42);
      ```
    </pre>

- [x] support line highlighting through `meta` field

    <pre>
    ```js lines=[1,2-4]
    var name
    name = 'hello';
    console.log(name);
    console.log(42)
    ```
    </pre>

## Use

```js
import {remark} from 'remark';
import {remarkCodeBlock} from 'remark-code-block';
import js from 'refractor/lang/javascript.js';

// register any languages you want to apply syntax highlighting first
remarkCodeBlock.register(js);

remark().use(remarkCodeBlock);
```

## Options

| Option              | Type      | Default | Description                                                             |
| ------------------- | --------- | ------- | ----------------------------------------------------------------------- |
| `enableLineNumbers` | `boolean` | `true`  | Attach line numbers to `span` elements so you can show them through CSS |
