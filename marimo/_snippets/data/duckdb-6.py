# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.0"
app = marimo.App()


@app.cell
def _(mo):
    mo.md(
        r"""
        # DuckDB：DML 操作中的事务与错误处理

        这个示例演示如何使用 SQLAlchemy 在 DuckDB 中管理事务。
        事务用于执行多条 DML 操作，错误会被捕获并报告，最终结果会在
        单独的单元格中打印。
        """
    )
    return


@app.cell
def _():
    from sqlalchemy import create_engine
    # 使用 SQLAlchemy 创建一个内存中的 DuckDB 引擎
    engine = create_engine("duckdb:///:memory:")
    return create_engine, engine


@app.cell
def _(engine, mo):
    try:
        # 开始事务并执行 DML 操作
        with engine.begin() as conn:
            conn.execute("CREATE OR REPLACE TABLE transaction_table (id INTEGER, name VARCHAR)")
            conn.execute("INSERT INTO transaction_table VALUES (1, 'Alice'), (2, 'Bob')")
            conn.execute("UPDATE transaction_table SET name = 'Charlie' WHERE id = 2")
            result = conn.execute("SELECT * FROM transaction_table").fetchall()
        print("事务成功；更改已提交。")
    except Exception as e:
        mo.md(f"事务错误：{e}")
        result = []
    return conn, result


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
