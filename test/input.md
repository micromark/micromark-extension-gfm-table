# Tables

## Examples from GFM

### A

| foo | bar |
| --- | --- |
| baz | bim |

### B

| abc | defghi |
:-: | -----------:
bar | baz

### C

| f\|oo  |
| ------ |
| b `\|` az |
| b **\|** im |

### D

| abc | def |
| --- | --- |
| bar | baz |
> bar

### E

| abc | def |
| --- | --- |
| bar | baz |
bar

bar

### F

| abc | def |
| --- |
| bar |

### G

| abc | def |
| --- | --- |
| bar |
| bar | baz | boo |

### H

| abc | def |
| --- | --- |

## Other examples

### An empty initial cell

| | a|c|
|--|:----:|:---|
|a|b|c|
|a|b|c|

### Some more escapes

| First \| first | Second \\| third \+ third |
| ----- | ------ | ----- |
| A: first | second | third |
| B: first | second \| second | third \|
| C: first | second \\| third \\|
| D: first | second \\\| second | third \\\|

Note: GFM is a funky, it parses C in a really weird way.
It completely drops the escaped escapes, and the treats the pipes as being escaped.
That’s not how markdown works and makes no sense whatsoever.

### In lists

*   Unordered:

    | A | B |
    | - | - |
    | 1 | 2 |

1.  Ordered:

    | A | B |
    | - | - |
    | 1 | 2 |

*   Lazy?
    | A | B |
    | - | - |
   | 1 | 2 |
  | 3 | 4 |
 | 5 | 6 |
| 7 | 8 |

### In block quotes

> W/ space:
> | A | B |
> | - | - |
> | 1 | 2 |

>W/o space:
>| A | B |
>| - | - |
>| 1 | 2 |

> Lazy?
> | A | B |
> | - | - |
> | 1 | 2 |
>| 3 | 4 |
| 5 | 6 |

### Missing alignment characters

| a | b | c |
|   |---|---|
| d | e | f |

* * *

| a | b | c |
|---|---|   |
| d | e | f |

### Incorrect characters

| a | b | c |
|---|-*-|---|
| d | e | f |

### Loose

Header 1 | Header 2
-------- | --------
Cell 1   | Cell 2
Cell 3   | Cell 4

### No body

| a | b | c |
| - | - | - |

### One column

| a |
| - |
| b |

### One “column”, loose

a
-
b

### Grave accent in cell

| A            | B |
|--------------|---|
| <kbd>`</kbd> | C |

### Escaped grave accent in “inline code” in cell

| A   |
|-----|
| `\` |

### “Empty” inline code

| 1 | 2    | 3  |
|---|------|----|
| a |   `` |    |
| b |   `` | `` |
| c |    ` | `  |
| d |     `|`   |
| e | `\|` |    |
| f |   \| |    |

### No pipe in first row

a
| - |

### List interrupting delimiters

a |
- |

a
-|

a
|-

### Indented delimiter row

a
   |-

a
    |-

### Two alignments

|a|
|::|

|a|
|:-:|

### Two at the start or end

|a|
|::-|

|a|
|-::|

### In the middle

|a|
|-:-|

### A space in the middle

|a|
|- -|

### No pipe

a
:-:

a
:-

a
-:

### A single colon

|a|
|:|

a
:

### Escaped pipes in code in cells

| `\|\\` |
| --- |
| `\|\\` |

`\|\\`

### Alignment on empty cells

| a | b | c | d | e |
| - | - | :- | -: | :-: |
| f |

### Indented body

| a |
 | - |
  | C |
   | D |
    | E |
