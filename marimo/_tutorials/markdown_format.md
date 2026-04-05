---
title: Markdown
marimo-version: 0.13.2
author: Marimo Team
description: >-
  Markdown 是一种轻量级标记语言，使用纯文本格式语法。`marimo`
  notebook 也可以保存为 markdown 文件，让你在喜欢的编辑器里处理以文本为主的 notebook。
pyproject: |-
  requires-python = ">=3.12"
  dependencies = [
      "marimo",
      "duckdb==1.2.2",
      "matplotlib==3.10.1",
      "sqlglot==26.16.2",
  ]
---

# Markdown 文件格式

默认情况下，marimo notebook 会保存为纯 Python 文件。不过，
你也可以把 marimo notebook 保存并编辑为 `.md` 文件，方便在自己喜欢的编辑器里处理以文本为主的 notebook。

_一定要看看这个教程的 markdown
[源代码](https://github.com/marimo-team/marimo/blob/main/marimo/_tutorials/markdown_format.md)！_

## 运行 markdown notebook

要编辑 markdown notebook，使用

```bash
$ marimo edit notebook.md
```

要把它作为应用运行，使用

```bash
$ marimo run notebook.md
```
<!---->
## 从 Python 导出

你可以通过运行下面的命令，把以 Python 存储的 marimo notebook 导出为 markdown 格式：

```bash
$ marimo export md notebook.py > notebook.md
```
<!---->
## 创建 Python 单元格

当你确实需要在 markdown 格式中创建 Python 单元格时，可以使用特殊代码块：

````md
```python {.marimo}
import matplotlib.pyplot as plt
plt.plot([1, 2, 3, 4])
```
````

这会创建下面这个单元格：

```python {.marimo}
import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4])
plt.gca()
```

只要你的代码块在花括号里包含 `marimo`，比如
`{marimo}` 或 `{.marimo note="Whatever you want"}`，marimo 就会把它当作 Python 单元格。

## `mo` tricks and tips

你可以通过空的 HTML 标签 `<!---->` 把 markdown 拆成多个单元格：
<!---->
查看这个 notebook 的源代码可以看到这个单元格是如何创建的。
<!---->
你仍然可以在 markdown notebook 中隐藏单元格代码：

````md
```python {.marimo hide_code="true"}
form = (
    # ...
    # 只是一个稍微复杂一点的内容
    # 你可能不想在编辑器里看到它。
    # ...
)
form
```
````

```python {.marimo hide_code="true"}
form = (
    mo.md('''
    **markdown 到底有多棒？**

    {markdown_is_awesome}

    {marimo_is_amazing}
''')
    .batch(
        markdown_is_awesome=mo.ui.text(label="你有多喜欢 markdown？", placeholder="还挺不错 🌊"),
        marimo_is_amazing=mo.ui.slider(label="你有多喜欢 marimo？", start=0, stop=11, value=11),
    )
    .form(show_clear_button=True, bordered=False)
)
form
```

也可以禁用单元格：

````md
```python {.marimo disabled="true"}
    print("这个代码单元格已被禁用，不应该有输出！")
```
````

```python {.marimo disabled="true"}
print("这个代码单元格已被禁用，不应该有输出！")
```

此外，marimo 能识别代码中的语法问题：

````md
```python {.marimo}
print("这个代码单元格有语法错误"
```
````

在保存 notebook 时，还会自动为你标注该单元格：

````md
```python {.marimo unparseable="true"}
print("这个代码单元格有语法错误"
```
````

```python {.marimo unparsable="true"}
print("这个代码单元格有语法错误"
```

## markdown 格式的限制

marimo 对 markdown 的支持会把 markdown 当作普通 markdown 处理。这
意味着如果你尝试使用字符串插值（比如 `f"{'🍃' * 7}"`），得到的只会是原始字符串。
这样可以清楚地区分哪些值应该计算，哪些值是静态的。要插入 Python
值，只需使用 Python 单元格：

```python {.marimo}
mo.md(f"""例如这样：{"🍃" * 7}""")
```

`````python {.marimo hide_code="true"}
mo.md(r"""
### 转换限制

当你尝试实现如下单元格块时：

````md
```python {.marimo}
mo.md("这是一个 markdown 单元格")
```
````

markdown 格式会自动把它保留为 markdown。不过，
某些歧义情况无法这样转换为 markdown：
""")
`````

````python {.marimo}
mo.md("""
这是一个包含执行块的 markdown 单元格
```python {.marimo}
# 过于歧义，无法转换
```
""")
````

你不太可能遇到这个问题，但请放心，marimo 会在后台尽量让你的 notebook 保持无歧义、整洁。
<!---->
### 保存多列模式

多列模式是可用的，不过每一列的第一个单元格必须是 Python 单元格，
这样才能指定列的起点并正确保存：

````md
```python {.marimo column="1"}
print("第 1 列的第一个单元格")
```
````
<!---->
### 为单元格命名

因为 markdown notebook 本质上就是 markdown，所以你不能像在 Python notebook 中那样从 markdown 单元格导入；
不过你仍然可以给单元格命名：

````md
```python {.marimo name="maybe"}
# 🎵 嗨，我们刚见面，这也太神奇了
```
````

```python {.marimo name="maybe"}
# 但这儿有我的 `cell_id`，所以就叫我 `maybe` 吧 🎶
```

### markdown 中的 SQL

你也可以通过 marimo 在 markdown 单元格中运行 SQL 查询，使用 `sql` 代码块即可。例如：

````md
```sql {.marimo}
SELECT GREATEST(x, y), SQRT(z) from uniformly_random_numbers
```
````

得到的分布可能会让你意外！🎲[^surprise]

[^surprise]: 总体分布应该是一样的

```sql {.marimo}
SELECT GREATEST(a, b), SQRT(c) from uniformly_random_numbers
```

在这种 SQL 格式中，SQL 查询里的 Python 变量插值会自动发生。此外，查询结果还可以通过 `query` 属性赋值给 dataframe。
例如，下面演示如何创建一个随机均匀分布，并把它赋给上面使用的 dataframe `uniformly_random_numbers`：

````md
```sql {.marimo query="uniformly_random_numbers" hide_output="true"}
SELECT i.range::text AS id,
       random() AS x,
       random() AS y,
       random() AS z
FROM
    -- 注意 sample_count 来自下面的滑块！
    range(1, {sample_count.value + 1}) i;
```
````

你可以在 SQL 教程中了解更多 SQL 的用法（`marimo tutorial sql`）

```python {.marimo hide_code="true"}
sample_count = mo.ui.slider(1, 1000, value=1000, label="样本数")
sample_count
```

```sql {.marimo query="uniformly_random_numbers" hide_output="True"}
SELECT i.range::text AS id,
       random() AS a,
       random() AS b,
       random() AS c
FROM range(1, {sample_count.value + 1}) i;
```

## 转回 Python 文件格式

markdown 格式的目的是降低编写以文本为主的文档的门槛，它并不是要完全取代 Python notebook 格式。
如果需要，你随时可以转换回 Python notebook：

```bash
$ marimo convert my_marimo.md > my_marimo.py
```
<!---->
## 更多 markdown 内容

请务必查看 `markdown.py` 教程（`marimo tutorial markdown`），了解更多如何在 marimo 中排版和渲染 markdown 的信息。

```python {.marimo hide_code="true"}
import marimo as mo
```
