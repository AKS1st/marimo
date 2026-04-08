# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # DuckDB：持久化数据库连接

        这个示例演示如何通过指定数据库文件来连接持久化 DuckDB 数据库，
        并执行 DDL/DML 操作以及查询数据。
        """
    )
    return


@app.cell
def _():
    # Define the persistent database file name
    db_file = "persistent_db.duckdb"
    return (db_file,)


@app.cell
def _(mo, persistent_table):
    # 使用 mo.sql 创建表（如果尚不存在），并插入示例数据。
    mo.sql("CREATE TABLE IF NOT EXISTS persistent_table (id INTEGER, value DOUBLE)")
    mo.sql("INSERT INTO persistent_table VALUES (1, 10.5), (2, 20.5)")
    result_df = mo.sql("SELECT * FROM persistent_table")
    return persistent_table, result_df


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
