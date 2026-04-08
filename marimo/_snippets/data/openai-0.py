# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.11.0"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # OpenAI：带流式响应的提示词

        向 OpenAI 或任何兼容 OpenAI 的端点发送提示，并将响应流式返回。
        """
    )
    return


@app.cell
def _():
    from openai import OpenAI
    return (OpenAI,)


@app.cell
def _(mo):
    api_key = mo.ui.text(label="API Key", kind="password")
    api_key
    return (api_key,)


@app.cell
def _(OpenAI, api_key):
    client = OpenAI(
        api_key=api_key.value,
        # 如果你使用的是其他兼容 OpenAI 的端点，请在这里修改。
        # base_url="https://api.openai.com/v1",
    )

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "你是一个乐于助人的助手。"},
            {
                "role": "user",
                "content": "写一首关于编程中递归的俳句。",
            },
        ],
        stream=True,
    )
    completion
    return client, completion


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
