# Copyright 2026 Marimo. All rights reserved.
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "duckdb==1.2.2",
#     "marimo",
#     "pandas==2.2.3",
#     "polars==1.27.1",
#     "pyarrow==19.0.1",
#     "sqlglot==26.13.0",
# ]
# ///

import marimo

__generated_with = "0.19.7"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # 你好，SQL！

    _让我们进入 SQL 的世界，在这里我们不仅能处理表，还能把它们连接起来！_
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    在 marimo 中，你可以自由组合 **Python 和 SQL**。要创建一个
    SQL 单元格，首先需要安装一些额外依赖，
    包括 [duckdb](https://duckdb.org/)。可以通过下面的命令安装：

    ```bash
    pip install 'marimo[sql]'
    ```
    """)
    return


@app.cell(hide_code=True)
def _():
    has_duckdb_installed = False
    try:
        import duckdb

        has_duckdb_installed = True
    except ImportError:
        pass

    has_polars_installed = False
    try:
        import polars

        has_polars_installed = True
    except ImportError:
        pass

    has_pandas_installed = False
    try:
        import pandas

        has_pandas_installed = True
    except ImportError:
        pass
    return has_duckdb_installed, has_polars_installed


@app.cell(hide_code=True)
def _(has_duckdb_installed, mo):
    if has_duckdb_installed:
        mo.output.replace(
            mo.md(
                """
                /// 提示 | "已安装"

                    如果你看到这条消息，说明 DuckDB 已经安装好了。
                ///
                """
            )
        )
    else:
        mo.output.replace(
            mo.md(
                """
                /// 警告 | "未安装"
                    如果你看到这条消息，说明 DuckDB 还没有安装。
                ///
                """
            )
        )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 创建 SQL 单元格

    安装所需依赖后，你可以通过以下方式之一创建 SQL 单元格：

    - 右键点击单元格左侧的 **添加单元格** ::lucide:circle-plus:: 按钮；
    - 点击单元格菜单中的 **转换为 SQL** ::lucide:database:: 按钮 ::lucide:ellipsis::
    - 点击页面底部的 **添加 SQL 单元格**；

    ## Python 表示形式
    即使用 SQL，marimo 本质上仍然是 Python。下面示例展示了
    marimo 如何在文件格式中把 SQL 嵌入 Python：

    ```python
    output_df = mo.sql(f"SELECT * FROM my_table LIMIT {max_rows.value}")
    ```

    注意，这个单元格里有一个 **`output_df`** 变量。它会是一个
    Polars DataFrame（如果你安装了 `polars`）或者一个 Pandas
    DataFrame（如果没有）。要与 SQL 结果交互，二者至少需要安装一个。

    SQL 语句本身是一个格式化字符串（f-string），这意味着它可以包含任意合法的 Python 代码，
    比如 UI 元素的值。也就是说，你的 SQL 语句和结果都可以是响应式的！🚀
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 用 SQL 查询 dataframe
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    /// 提示 | "变量面板"

        打开左侧工具栏中的变量面板，可以查看 notebook 可访问的所有 dataframe
        和内存表。
    ///
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    让我们看一个 SQL 单元格。下一个单元格会生成一个名为 `df` 的 dataframe。
    """)
    return


@app.cell(hide_code=True)
def _(has_polars_installed):
    _SIZE = 1000


    def _create_token_data(n_items=100):
        import random
        import string

        def generate_random_string(length):
            letters = string.ascii_lowercase
            result_str = "".join(random.choice(letters) for i in range(length))
            return result_str

        def generate_random_numbers(mean, std_dev, num_samples):
            return [int(random.gauss(mean, std_dev)) for _ in range(num_samples)]

        random_numbers = generate_random_numbers(50, 15, n_items)
        random_strings = sorted(
            list(set([generate_random_string(3) for _ in range(n_items)]))
        )

        return {
            "token": random_strings,
            "count": random_numbers[: len(random_strings)],
        }


    _data = _create_token_data(_SIZE)

    # Try polars
    if has_polars_installed:
        import polars as pl

        df = pl.DataFrame(_data)
    # Fallback to pandas (maybe trying to install it)
    else:
        import pandas as pd

        df = pd.DataFrame(_data)
    return (df,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    接下来，我们创建一个 SQL 查询，直接引用 Python dataframe `df`。
    """)
    return


@app.cell
def _(df, mo):
    _df = mo.sql(
        f"""
        -- 这个 SQL 单元格很特别，因为我们可以在 SQL 查询里把全局作用域中已有的 dataframe 当作表来引用。
        -- 例如，这里引用的是在另一个 Python 单元格中定义的 `df` dataframe。

        SELECT * FROM df;

        -- 默认情况下，输出变量以下划线开头（`_df`），这使它只属于当前单元格。
        -- 若想在其他单元格中访问查询结果，请修改输出变量名。
        """
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## 从 Python 到 SQL 再返回
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    你可以创建依赖 Python 值的 SQL 语句，比如依赖 UI 元素：
    """)
    return


@app.cell(hide_code=True)
def _(mo, string):
    token_prefix = mo.ui.dropdown(
        list(string.ascii_lowercase), label="词元前缀", value="a"
    )
    token_prefix
    return (token_prefix,)


@app.cell
def _(df, mo, token_prefix):
    result = mo.sql(
        f"""
        -- 改变下拉框，看看 SQL 查询是如何自我过滤的！
        --
        -- 这里我们使用 duckdb 的 `starts_with` 函数：
        SELECT * FROM df WHERE starts_with(token, '{token_prefix.value}')

        -- 注意我们把输出变量命名为 `result`
        """
    )
    return (result,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    因为上面我们把输出变量命名为 **`result`**，
    所以可以在 Python 中继续使用它。
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    charting_library = mo.ui.radio(["matplotlib", "altair", "plotly"])

    mo.md(
        f"""
        让我们用你选择的库来绘制结果：

        {charting_library}
        """
    )
    return (charting_library,)


@app.cell(hide_code=True)
def _(charting_library, mo, render_chart, token_prefix):
    _header = mo.md(
        f"""
        我们可以复用上面的下拉框：{token_prefix}

        现在我们有了一个直方图，用来展示以 {token_prefix.value} 开头的词元计数分布，
        这由你的 SQL 查询和 UI 元素共同驱动。
        """
    )

    render_chart(
        charting_library.value, _header
    ) if charting_library.value else None
    return


@app.cell(hide_code=True)
def _(mo, result, token_prefix):
    def render_chart(charting_library, header):
        return mo.vstack(
            [header, render_charting_library(charting_library)]
        ).center()


    def render_charting_library(charting_library):
        if charting_library == "matplotlib":
            return render_matplotlib()
        if charting_library == "altair":
            return render_altair()
        if charting_library == "plotly":
            return render_plotly()


    def render_matplotlib():
        import matplotlib.pyplot as plt

        plt.hist(result["count"], label=token_prefix.value)
        plt.xlabel("词元计数")
        plt.legend()
        plt.tight_layout()
        return plt.gcf()


    def render_altair():
        import altair as alt

        chart = (
            alt.Chart(result)
            .mark_bar()
            .encode(x=alt.X("count", bin=True), y=alt.Y("count()"))
        )
        return mo.ui.altair_chart(chart, chart_selection=False)


    def render_plotly():
        import plotly.graph_objects as go

        return go.Figure(data=[go.Histogram(x=result["count"])])

    return (render_chart,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## CSV、Parquet、Postgres 等更多数据源 ...
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    我们不局限于查询 dataframe。也可以查询 **HTTP URL、S3 路径，或者本地 csv / parquet 文件路径**。

    ```sql
    -- or
    SELECT * FROM 's3://my-bucket/file.parquet';
    -- or
    SELECT * FROM read_csv('path/to/example.csv');
    -- or
    SELECT * FROM read_parquet('path/to/example.parquet');
    ```

    只要加一点样板代码，你甚至可以读写 **Postgres**，并在同一个查询里把 Postgres 表和 dataframe 连接起来。
    完整支持的数据源列表请查看 [duckdb 扩展](https://duckdb.org/docs/extensions/overview) 以及我们的 [duckdb 连接示例 notebook](https://github.com/marimo-team/marimo/blob/main/examples/sql/duckdb_connections.**py**)。

    这个示例中，我们会查询一个返回 CSV 的 HTTP 端点。
    """)
    return


@app.cell
def _(mo):
    cars = mo.sql(
        f"""
        -- 下载一个 CSV 并创建内存表；这是可选的。
        CREATE OR replace TABLE cars as
        FROM 'https://datasets.marimo.app/cars.csv';

        -- 查询该表
        SELECT * from cars;
        """
    )
    return


@app.cell(hide_code=True)
def _(cars, mo):
    cylinders_dropdown = mo.ui.range_slider.from_series(
        cars["Cylinders"], debounce=True, show_value=True
    )
    origin_dropdown = mo.ui.dropdown.from_series(cars["Origin"], value="Asia")
    mo.hstack([cylinders_dropdown, origin_dropdown]).left()
    return cylinders_dropdown, origin_dropdown


@app.cell
def _(cars, cylinders_dropdown, mo, origin_dropdown):
    filtered_cars = mo.sql(
        f"""
        SELECT * FROM cars
        WHERE
            Cylinders >= {cylinders_dropdown.value[0]}
            AND
            Cylinders <= {cylinders_dropdown.value[1]}
            AND
            ORIGIN = '{origin_dropdown.value}'
        """
    )
    return (filtered_cars,)


@app.cell(hide_code=True)
def _(filtered_cars, mo):
    mo.hstack(
        [
            mo.stat(label="汽车总数", value=str(len(filtered_cars))),
            mo.stat(
                label="高速公路平均 MPG",
                value=f"{filtered_cars['MPG_Highway'].mean() or 0:.1f}",
            ),
            mo.stat(
                label="城市平均 MPG",
                value=f"{filtered_cars['MPG_City'].mean() or 0:.1f}",
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _():
    import marimo as mo
    import random

    return (mo,)


@app.cell(hide_code=True)
def _():
    import string

    return (string,)


if __name__ == "__main__":
    app.run()
