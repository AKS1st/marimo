# Copyright 2026 Marimo. All rights reserved

import marimo

__generated_with = "0.19.7"
app = marimo.App()

with app.setup:
    import dataclasses
    import random


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # 文件格式

    marimo 应用会保存为纯 Python 文件。

    这些文件：

    - 🤖 人和机器都容易阅读
    - ✏️ 可以用你喜欢的工具格式化
    - ➕ 很容易用 git 管理，diff 很小
    - 🐍 可以作为 Python 脚本运行，UI 元素会使用默认值
    - 🧩 具有模块化特性，能暴露可从 notebook 导入的函数和类
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 示例

    设想一个包含下面四个单元格的 marimo notebook。

    第一个单元格：
    ```python3
    print(text.value)
    ```

    第二个单元格：
    ```python3
    def say_hello(name="World"):
        return f"Hello, {name}!"
    ```

    第三个单元格：
    ```python3
    text = mo.ui.text(value=say_hello())
    text
    ```

    第四个单元格：
    ```python3
    import marimo as mo
    ```
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    对于上面的示例，marimo 会生成下面的文件内容：

    ```python3
    import marimo

    __generated_with = "0.0.0"
    app = marimo.App()

    @app.cell
    def _(text):
        print(text.value)
        return

    @app.function
    def say_hello(name="World"):
        return f"Hello, {name}!"

    @app.cell
    def _(mo):
        text = mo.ui.text(value=say_hello())
        text
        return (text,)

    @app.cell
    def _():
        import marimo as mo
        return mo,

    if __name__ == "__main__":
        app.run()
    ```

    如你所见，这就是_纯 Python_。这也是 marimo 生成文件 **适合 git 管理** 的原因之一：
    在 marimo 编辑器里做的微小改动，只会让生成的文件产生很小的 diff。

    此外，那个只定义了一个纯函数 `say_hello` 的单元格被保存在 notebook 文件的“顶层”，
    这使你可以把它导入到其他 Python 文件或 notebook 中。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 特性

    marimo 的文件格式被设计为易读、易用，同时也满足 marimo 库本身的需求。
    你甚至可以直接用自己喜欢的文本编辑器编辑生成文件中的单元格，并用喜欢的代码格式化工具格式化它。

    下面我们会说明 marimo 文件格式的一些特性。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.accordion(
        {
            "单元格就是函数": """
        在 `dataflow` 教程中，我们看到单元格就像函数，把它们的 refs（它们读取但不定义的全局变量）映射到 defs（它们定义的全局变量）。生成后的代码把这种类比明确地表现出来。

        在生成代码里，每个单元格都有一个对应的函数。函数的参数是单元格的 refs，返回的变量是会被其他单元格引用的 defs。

        例如，下面的代码

        ```python3
        @app.cell
        def _(mo):
            text = mo.ui.text(value="Hello, World!")
            text
            return text,
        ```

            表示这个单元格以名为 `mo` 的变量作为输入，并创建了一个名为 `text` 的全局变量（会被其他单元格读取）。

        相比之下，下面的代码

        ```python3
        @app.cell
        def _():
            import marimo as mo
            return mo,
        ```

            表示这个单元格不依赖任何其他单元格（它的参数列表为空），不过它确实创建了变量 `mo`，而前一个单元格把它作为输入。
            """,
            "单元格按展示顺序保存": """
        单元格会按照它们在 marimo 编辑器中的排列顺序保存。所以如果你想用自己喜欢的文本编辑器重新排列单元格，只需要调整它们在文件中的定义顺序即可。
        """,
            "文本格式会被保留": """
        marimo 保证，你在 marimo 编辑器中如何格式化源代码，生成代码里就会如何保存。比如空白、换行等等都会被完整保留。
        这意味着你可以在文本编辑器中手动或借助像 Black 这样的自动格式化工具调整格式，并确信这些更改会被保留下来。
        """,
            "单元格函数可以有名字": """
        如果你愿意，可以把单元格函数的默认名字替换成有意义的名字。

        例如，把

        ```python3
        @app.cell
        def _(text):
            print(text.value)
            return
        ```

        to

        ```python3
        @app.cell
        def echo(text):
            print(text.value)
            return
        ```

        这样可以让生成的代码更易读。
        """,
            "没有魔法标记": """
        marimo 生成的代码就是纯 Python，没有魔法语法。
        """,
            "单元格签名会自动维护": """
        如果你在编辑单元格时忘了把某个单元格的所有 refs 放进参数列表，或者忘了把所有 defs 放进返回值，
        marimo 会在你下次尝试在 marimo 编辑器中打开它时帮你修复。所以不用担心自己会把单元格签名弄坏。
        """,
            "`app` 对象": """
        在生成代码的顶部，会创建一个名为 `app` 的变量。这个对象使用 `cell` 装饰器把各个单元格收集成数据流图。
        """,
            "可作为脚本运行": """
        你可以在命令行用 Python 把 marimo 应用当作脚本运行。这会按拓扑排序的顺序执行单元格，就像你用 `marimo edit` 打开应用时那样。

        例如：把我们的示例作为脚本运行，会在控制台打印 `Hello World!`。
        """,
            "可作为模块使用": """
        可以把 notebook 顶层的函数和类导入到其他 Python 文件中。
        """,
        }
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 从 notebook 导入函数和类

    如果你想把 notebook 中定义的函数和类导入到其他 Python 模块中，那么了解 marimo 文件格式的细节很重要。
    如果你不打算这么做，可以跳过这一节。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### 声明函数和类所使用的导入

    marimo 可以把函数和类序列化到文件顶层，所以你可以用普通的 Python 语法导入它们：

    ```python
    from my_notebook import my_function
    ```

    特别是，如果某个单元格只定义了一个函数或类，并且该函数或类除了引用一个特殊的 **setup cell** 中定义的变量外都是纯净的，那么它就会被序列化到顶层。

    **setup cell。** Notebook 可以可选地包含一个用于导入模块的 setup cell，在文件中写作：

    <!-- note this setup cell is hardcoded in the playground example -->
    ```python
    with app.setup:
        import marimo as mo
        import dataclasses
    ```

    在 setup cell 中导入的模块可以被“顶层”的函数或类使用。你可以在编辑器的总菜单中添加 setup cell：
    ::lucide:diamond-plus:: 添加 setup cell。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### 函数和类

    Notebook 文件会暴露只依赖于 setup cell 中定义的变量（或其他此类函数/类）的函数和类。例如，下面这个单元格：
    """)
    return


@app.function
def roll_die():
    """
    一个可复用的函数。

    注意单元格右下角的标识。
    """
    return random.randint(1, 7)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ……会被保存为 notebook 文件中的如下内容：

    ```python
    @app.function
    def roll_die():
        '''
        一个可复用的函数。

        注意单元格右下角的标识。
        '''
        return random.randint(1, 7)
    ```


    因此可以这样导入：

    ```python
    from my_notebook import roll_die
    ```
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    独立的类也会被暴露：
    """)
    return


@app.class_definition
@dataclasses.dataclass
class SimulationExample:
    n_rolls: int

    def simulate(self) -> list[int]:
        return [roll_die() for _ in range(self.n_rolls)]


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    这个类会被保存在文件中，形式如下：

    ```python
    @app.class_definition
    @dataclasses.dataclass
    class SimulationExample:
        n_rolls: int

        def simulate(self) -> list[int]:
            return [roll_die() for _ in range(self.n_rolls)]
    ```
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    /// attention | 提醒
    ///

    并不是所有独立函数都会在模块中暴露。如果你的函数依赖于其他单元格中定义的变量，那么它就不会以顶层形式暴露。


    例如，下面这个函数不会被暴露：
    """)
    return


@app.cell
def _():
    variable = 123
    return (variable,)


@app.cell
def wrapped_function_example(variable):
    def not_a_top_level_function():
        """
        这个函数依赖于另一个单元格中声明的变量。

        因此，这个函数不会在文件中暴露出来——右下角的提示也会说明这一点。
        """
        return variable

    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## FAQ

    ### 我想在别的编辑器里编辑 notebook，需要知道什么？

    请查看[使用自己的编辑器](https://docs.marimo.io/guides/editor_features/watching/)文档。

    ### 我想从 marimo notebook 导入函数，需要知道什么？

    请查看[可复用函数和类](https://links.marimo.app/reusable-functions)文档。

    ### 我想在 marimo notebook 上运行 pytest，需要知道什么？

    请查看[测试](https://docs.marimo.io/guides/testing/)文档。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 这个 notebook 的源代码

    下面显示的是这个 notebook 的源代码：
    """)
    return


@app.cell
def _():
    with open(__file__, "r", encoding="utf-8") as f:
        contents = f.read()
    return (contents,)


@app.cell
def _(contents, mo):
    mo.ui.code_editor(contents)
    return


if __name__ == "__main__":
    app.run()
