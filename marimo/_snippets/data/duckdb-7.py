# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # DuckDB：JSON 文件导入

        这个示例演示如何直接使用 DuckDB 查询 JSON 文件。
        """
    )
    return


@app.cell
def _():
    json_path = 'sample-file.json'
    return (json_path,)


@app.cell
def _(json_path, mo):
    query = mo.sql(
        f"""
        SELECT * FROM read_json_auto('{json_path}')
        LIMIT 10
        """
    )
    return (query,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
