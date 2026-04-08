# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.3.8"
app = marimo.App()


@app.cell
def __(mo):
    mo.md(
        r"""
        # Pandas DataFrame：将列表列中的每个值展开为一行
        """
    )
    return


@app.cell
def __(mo):
    mo.md(
        r"""
        创建一个新的 DataFrame，作为输入的转换结果。例如：
        *   输入：df 中有一列名为 `msg_ids`，其中每个元素都是一个值列表（也就是说，一些行里会有多个值）。
        *   输出：new_df 会针对原始 `msg_ids` 列里出现过的每个唯一值保留一行，并将该值放入名为 `msg_id` 的新列。

        """
    )
    return


@app.cell
def __():
    import pandas as pd

    df = pd.DataFrame(
        {
            "date": ["9/1/22", "9/2/22", "9/3/22"],
            "action": ["添加", "更新", "删除"],
            "msg_ids": [[1, 2, 3], [], [2, 3]],
        }
    )
    df.set_index("date", inplace=True)

    temp_series = df["msg_ids"].apply(pd.Series, 1).stack()
    temp_series.index = temp_series.index.droplevel(-1)
    temp_series.name = "msg_id"
    new_df = temp_series.to_frame()
    new_df.set_index("msg_id", inplace=True)
    new_df.loc[~new_df.index.duplicated(), :]  # Drop duplicates.
    return df, new_df, pd, temp_series


@app.cell
def __():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
