# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.19.7"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # UI 元素

    marimo 最强大的特性之一，是对交互式用户界面（UI）元素的一等支持：
    与 UI 元素交互会自动运行引用它的单元格。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## marimo.ui
    """)
    return


@app.cell
def _(mo):
    slider = mo.ui.slider(start=1, stop=10, step=1)
    slider

    mo.md(
        f"""
        `marimo.ui` 模块提供了一系列预构建的元素。

        例如，这里是一个 `slider`：{slider}
        """
    )
    return (slider,)


@app.cell
def _(mo, slider):
    mo.md(f"它的值是：**{slider.value}**。")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 交互如何触发单元格运行

    每当你与 UI 元素交互时，它的值都会被发送回 Python。发生这种情况时，
    所有引用该 UI 元素所绑定的全局变量、但不定义它的单元格都会运行。

    这个简单规则让你可以用 UI 元素驱动程序执行，
    从而构建交互式 notebook 和工具，供自己和他人使用。
    """)
    return


@app.cell(hide_code=True)
def _(mo, slider):
    mo.accordion(
        {
            "提示：把 UI 元素赋给全局变量": (
                """
                只有当 UI 元素被赋给全局变量时，与显示出来的 UI 元素交互才会触发响应式执行。
                """
            ),
            "提示：访问元素的值": (
                """
                每个 UI 元素都有一个 `value` 属性，你可以在 Python 中访问它。
                """
            ),
            "提示：在 markdown 中嵌入 UI 元素": mo.md(
                f"""
                你可以使用 f-string 将 UI 元素嵌入 markdown。

                例如，我们可以在这里渲染滑块：{slider}
                """
            ),
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 简单元素
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    marimo 提供了一个[庞大的简单 UI 元素库](https://docs.marimo.io/api/inputs/index.html)。下面只是几个示例：
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        """
        请查看 GitHub 上的 [examples 目录](https://github.com/marimo-team/marimo/tree/main/examples/ui)，
        里面有展示所有 UI 元素的短小 notebook。更详细的参考请看我们的 [API 文档](https://docs.marimo.io/api/inputs/)。
        """
    ).callout()
    return


@app.cell
def _(mo):
    number = mo.ui.number(start=1, stop=10, step=1)
    number
    return (number,)


@app.cell
def _(number):
    number.value
    return


@app.cell
def _(mo):
    checkbox = mo.ui.checkbox(label="复选框")
    checkbox
    return (checkbox,)


@app.cell
def _(checkbox):
    checkbox.value
    return


@app.cell
def _(mo):
    text = mo.ui.text(placeholder="输入一些文本 ...")
    text
    return (text,)


@app.cell
def _(text):
    text.value
    return


@app.cell
def _(mo):
    text_area = mo.ui.text_area(placeholder="输入一些文本 ...")
    text_area
    return (text_area,)


@app.cell
def _(text_area):
    text_area.value
    return


@app.cell
def _(mo):
    dropdown = mo.ui.dropdown(["a", "b", "c"])
    dropdown
    return (dropdown,)


@app.cell
def _(dropdown):
    dropdown.value
    return


@app.cell
def _(mo):
    run_button = mo.ui.run_button(label="点我")
    run_button
    return (run_button,)


@app.cell
def _(run_button):
    "运行按钮已点击！" if run_button.value else "点击运行按钮！"
    return


@app.cell
def _(mo):
    file_upload = mo.ui.file(kind="area")
    file_upload
    return (file_upload,)


@app.cell
def _(file_upload):
    file_upload.value
    return


@app.cell
def _(basic_ui_elements, mo):
    mo.md(f"要查看更多示例，请使用这个下拉框：{basic_ui_elements}")
    return


@app.cell
def _(basic_ui_elements, construct_element, show_element):
    selected_element = construct_element(basic_ui_elements.value)
    show_element(selected_element)
    return (selected_element,)


@app.cell
def _(selected_element, value):
    value(selected_element)
    return


@app.cell
def _(basic_ui_elements, documentation):
    documentation(basic_ui_elements.value)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    `mo.ui.matrix` 可以让你交互式编辑二维数值数据。
    """)
    return


@app.cell
def _(mo):
    matrix = mo.ui.matrix(
        [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        min_value=-5,
        max_value=5,
        step=0.1,
        precision=1,
        label="$I$",
    )
    matrix
    return (matrix,)


@app.cell
def _(matrix):
    matrix.value
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ### 复合元素

        复合元素是高级元素，它们允许你用其他 UI 元素来构建 UI 元素。

        你可以使用这些强大的元素来逻辑分组相关元素、
        创建动态的 UI 元素集合，或者减少程序中的全局变量数量。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    第一个示例展示了如何使用 `mo.ui.array` 创建一个 UI 元素数组。
    当你与数组中的某个元素交互时，所有引用该数组的单元格都会响应式运行。
    如果你使用普通的 Python 列表，引用该列表的单元格则_不会_被运行。
    """)
    return


@app.cell
def _(mo):
    array = mo.ui.array(
        [mo.ui.text(), mo.ui.slider(start=1, stop=10), mo.ui.date()]
    )
    array
    return (array,)


@app.cell
def _(array):
    array.value
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    marimo 还提供了 `mo.ui.dictionary`，它类似于 `mo.ui.array`。
    """)
    return


@app.cell
def _(mo):
    dictionary = mo.ui.dictionary(
        {
            "text": mo.ui.text(),
            "slider": mo.ui.slider(start=1, stop=10),
            "date": mo.ui.date(),
        }
    )
    dictionary
    return (dictionary,)


@app.cell
def _(dictionary):
    dictionary.value
    return


@app.cell(hide_code=True)
def _(composite_elements, mo):
    mo.md(
        f"要查看其他复合元素，请使用这个下拉框：{composite_elements}"
    )
    return


@app.cell
def _(composite_elements, construct_element, show_element):
    composite_element = construct_element(composite_elements.value)
    show_element(composite_element)
    return (composite_element,)


@app.cell
def _(composite_element, value):
    value(composite_element)
    return


@app.cell
def _(composite_elements, documentation):
    documentation(composite_elements.value)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### 构建自定义元素

    marimo 通过 anywidget 支持第三方 UI 元素，这让你可以构建自己
    的交互式 UI 元素，或者使用社区中别人构建的组件。想了解更多，
    [请看文档](https://docs.marimo.io/guides/integrating_with_marimo/custom_ui_plugins.html)。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 附录
    剩下的单元格是一些辅助数据结构和函数。
    如果你好奇这个教程的某些部分是如何实现的，可以看看它们的代码。
    """)
    return


@app.cell
def _(mo):
    composite_elements = mo.ui.dropdown(
        options=dict(
            sorted(
                {
                    "array": mo.ui.array,
                    "batch": mo.ui.batch,
                    "dictionary": mo.ui.dictionary,
                    "form": mo.ui.form,
                }.items()
            )
        ),
        allow_select_none=True
    )
    return (composite_elements,)


@app.cell
def _(mo):
    basic_ui_elements = mo.ui.dropdown(
        options=dict(
            sorted(
                {
                    "button": mo.ui.button,
                    "checkbox": mo.ui.checkbox,
                    "date": mo.ui.date,
                    "dropdown": mo.ui.dropdown,
                    "file": mo.ui.file,
                    "matrix": mo.ui.matrix,
                    "multiselect": mo.ui.multiselect,
                    "number": mo.ui.number,
                    "radio": mo.ui.radio,
                    "range_slider": mo.ui.range_slider,
                    "slider": mo.ui.slider,
                    "switch": mo.ui.switch,
                    "tabs": mo.ui.tabs,
                    "table": mo.ui.table,
                    "text": mo.ui.text,
                    "text_area": mo.ui.text_area,
                }.items()
            )
        ),
    )
    return (basic_ui_elements,)


@app.cell
def _(mo):
    def construct_element(value):
        if value == mo.ui.array:
            return mo.ui.array(
                [mo.ui.text(), mo.ui.slider(1, 10), mo.ui.date()]
            )
        elif value == mo.ui.batch:
            return mo.md(
                """
                - 姓名：{name}
                - 日期：{date}
                """
            ).batch(name=mo.ui.text(), date=mo.ui.date())
        elif value == mo.ui.button:
            return mo.ui.button(
                value=0, label="点我", on_click=lambda value: value + 1
            )
        elif value == mo.ui.checkbox:
            return mo.ui.checkbox(label="勾选我")
        elif value == mo.ui.date:
            return mo.ui.date()
        elif value == mo.ui.dictionary:
            return mo.ui.dictionary(
                {
                    "slider": mo.ui.slider(1, 10),
                    "text": mo.ui.text("输入点什么！"),
                    "array": mo.ui.array(
                        [
                            mo.ui.button(value=0, on_click=lambda v: v + 1)
                            for _ in range(3)
                        ],
                        label="按钮",
                    ),
                }
            )
        elif value == mo.ui.dropdown:
            return mo.ui.dropdown(["a", "b", "c"])
        elif value == mo.ui.file:
            return [mo.ui.file(kind="button"), mo.ui.file(kind="area")]
        elif value == mo.ui.form:
            return mo.ui.text_area(placeholder="...").form()
        elif value == mo.ui.matrix:
            return mo.ui.matrix(
                [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
                min_value=-5,
                max_value=5,
                step=0.1,
                precision=1,
                label="$I$",
            )
        elif value == mo.ui.multiselect:
            return mo.ui.multiselect(["a", "b", "c"])
        elif value == mo.ui.number:
            return mo.ui.number(start=1, stop=10, step=0.5)
        elif value == mo.ui.radio:
            return mo.ui.radio(["a", "b", "c"], value="a")
        elif value == mo.ui.range_slider:
            return mo.ui.range_slider(start=1, stop=10, step=0.5)
        elif value == mo.ui.slider:
            return mo.ui.slider(start=1, stop=10, step=0.5)
        elif value == mo.ui.switch:
            return mo.ui.switch()
        elif value == mo.ui.tabs:
            return mo.ui.tabs(
                {
                    "员工 #1": {
                        "first_name": "Michael",
                        "last_name": "Scott",
                    },
                    "员工 #2": {
                        "first_name": "Dwight",
                        "last_name": "Schrute",
                    },
                }
            )
        elif value == mo.ui.table:
            return mo.ui.table(
                data=[
                    {"first_name": "Michael", "last_name": "Scott"},
                    {"first_name": "Dwight", "last_name": "Schrute"},
                ],
                label="员工",
            )
        elif value == mo.ui.text:
            return mo.ui.text()
        elif value == mo.ui.text_area:
            return mo.ui.text_area()
        return None

    return (construct_element,)


@app.cell
def _(mo):
    def show_element(element):
        if element is not None:
            return mo.hstack([element], justify="center")

    return (show_element,)


@app.cell
def _(mo):
    def value(element):
        if element is not None:
            v = (
                element.value
                if not isinstance(element, mo.ui.file)
                else element.name()
            )
            return mo.md(
                f"""
                该元素当前的值是 {mo.as_html(element.value)}
                """
            )

    return (value,)


@app.cell
def _(mo):
    def documentation(element):
        if element is not None:
            return mo.accordion(
                {
                    f"`mo.ui.{element.__name__}` 的文档": mo.doc(
                        element
                    )
                }
            )

    return (documentation,)


@app.cell
def _():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
