# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.19.7"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # 布局

    `marimo` 提供了一些函数来帮助你组织输出，例如行和列、
    折叠面板、标签页和提示框。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 行与列

    使用 `mo.hstack` 和 `mo.vstack` 把对象排列成行和列。
    """)
    return


@app.cell
def _(mo):
    mo.hstack(
        [mo.ui.text(label="你好"), mo.ui.slider(1, 10, label="滑块")],
        justify="start",
    )
    return


@app.cell
def _(mo):
    mo.vstack([mo.ui.text(label="世界"), mo.ui.number(1, 10, label="数字")])
    return


@app.cell
def _(mo):
    grid = mo.vstack(
        [
            mo.hstack(
                [mo.ui.text(label="你好"), mo.ui.slider(1, 10, label="滑块")],
            ),
            mo.hstack(
                [mo.ui.text(label="世界"), mo.ui.number(1, 10, label="数字")],
            ),
        ],
    ).center()

    mo.md(
        f"""
        结合 `mo.hstack` 和 `mo.vstack` 可以创建网格：

        {grid}

        你可以把任何对象传给 `mo.hstack` 或 `mo.vstack`（包括图表！）。
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    **自定义。**
    堆叠元素的呈现可以通过一些参数自定义，最好通过示例来理解。
    """)
    return


@app.cell
def _(mo):
    justify = mo.ui.dropdown(
        ["start", "center", "end", "space-between", "space-around"],
        value="space-between",
        label="对齐方式",
    )
    align = mo.ui.dropdown(
        ["start", "center", "end", "stretch"], value="center", label="对齐"
    )
    gap = mo.ui.number(start=0, step=0.25, stop=2, value=0.5, label="间距")
    wrap = mo.ui.checkbox(label="换行")

    mo.hstack([justify, align, gap, wrap], justify="center")
    return align, gap, justify, wrap


@app.cell
def _(mo):
    size = mo.ui.slider(label="方块大小", start=60, stop=500)
    mo.hstack([size], justify="center")
    return (size,)


@app.cell
def _(align, boxes, gap, justify, mo, wrap):
    mo.hstack(
        boxes,
        align=align.value,
        justify=justify.value,
        gap=gap.value,
        wrap=wrap.value,
    )
    return


@app.cell
def _(align, boxes, gap, mo):
    mo.vstack(
        boxes,
        align=align.value,
        gap=gap.value,
    )
    return


@app.cell
def _(mo, size):
    def create_box(num=1):
        box_size = size.value + num * 10
        return mo.Html(
            f"<div style='min-width: {box_size}px; min-height: {box_size}px; background-color: orange; text-align: center; line-height: {box_size}px'>{str(num)}</div>"
        )


    boxes = [create_box(i) for i in range(1, 5)]
    return (boxes,)


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "`mo.hstack` 文档": mo.doc(mo.hstack),
            "`mo.vstack` 文档": mo.doc(mo.vstack),
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    **对 `Html` 对象进行对齐。** 虽然你可以使用 `mo.hstack` 将任何对象居中或右对齐，
    但 `Html` 对象（大多数 marimo 函数返回的对象，以及大多数 marimo 类的子类）
    还可以直接使用 `center`、`right` 和 `left` 方法。
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    这段 markdown 左对齐。
    """)
    return


@app.cell
def _(mo):
    mo.md("这段 markdown 居中。").center()
    return


@app.cell
def _(mo):
    mo.md("这段 markdown 右对齐。").right()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "`Html.center` 文档": mo.doc(mo.Html.center),
            "`Html.right` 文档": mo.doc(mo.Html.right),
            "`Html.left` 文档": mo.doc(mo.Html.left),
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 折叠面板

    使用 `mo.accordion` 创建可展开的内容面板：
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    折叠面板可以包含多个条目：
    """)
    return


@app.cell
def _(mo):
    mo.accordion(
        {
            "多个条目": "默认情况下，同一时间只能展开一个条目",
            "允许同时展开多个条目": (
                """
                使用关键字参数 `multiple=True` 可以允许多个条目同时展开。
                """
            ),
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 标签页

    使用 `mo.ui.tabs` 在单个标签页输出中显示多个对象：
    """)
    return


@app.cell
def _(mo):
    _settings = mo.vstack(
        [
            mo.md("**Edit User**"),
            mo.ui.text(label="First Name"),
            mo.ui.text(label="Last Name"),
        ]
    )

    _organization = mo.vstack(
        [
            mo.md("**Edit Organization**"),
            mo.ui.text(label="Organization Name"),
            mo.ui.number(label="Number of employees", start=0, stop=1000),
        ]
    )

    mo.ui.tabs(
        {
            "🧙‍♀ 用户": _settings,
            "🏢 组织": _organization,
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion({"`mo.ui.tabs` 文档": mo.doc(mo.ui.tabs)})
    return


@app.cell
def _(mo):
    _t = [
        mo.md("**Hello!**"),
        mo.md(r"$f(x)$"),
        {"c": mo.ui.slider(1, 10), "d": (mo.ui.checkbox(), mo.ui.switch())},
    ]

    mo.md(
        f"""
        ## 树

        使用 `mo.tree` 显示列表、字典和元组的嵌套结构：

        {mo.tree(_t)}
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion({"`mo.tree` 文档": mo.doc(mo.tree)})
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 提示框

    使用 `callout` 方法把任意 markdown 或 HTML 转成强调提示框：
    """)
    return


@app.cell
def _(mo):
    callout_kind = mo.ui.dropdown(
        ["neutral", "warn", "success", "info", "danger"], value="neutral"
    )
    return (callout_kind,)


@app.cell
def _(callout_kind, mo):
    mo.md(
        f"""
        **这是一个提示框！**

        你可以把任意 HTML 或 markdown 转成强调提示框。
        你可以选择不同类型的提示框。当前这个是：
        {callout_kind}
        """
    ).callout(kind=callout_kind.value)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion({"`mo.callout` 文档": mo.doc(mo.callout)})
    return


@app.cell
def _():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
