# Some more escapes

| Head          |
| ------------- |
| A | Alpha     |
| B \| Bravo    |
| C \\| Charlie |
| D \\\| Delta  |
| E \\\\| Echo  |
| F \ Foxtrott  |

Note: GH has a bug where in case C and E, the escaped escape is treated as a
normal escape: [see this issue](https://github.com/github/cmark-gfm/issues/277).

| a \ b \+ c `\|` d |
| ----------------- |
