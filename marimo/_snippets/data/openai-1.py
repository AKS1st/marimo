# Copyright 2026 Marimo. All rights reserved.
import marimo

__generated_with = "0.11.0"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
        # OpenAI：聊天机器人

        将 OpenAI 或任何兼容 OpenAI 的端点转换为聊天机器人。
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
def _(api_key, mo):
    chat = mo.ui.chat(
        mo.ai.llm.openai(
            "gpt-4o-mini",
            api_key=api_key.value,
            # 如果你使用的是其他兼容 OpenAI 的端点，请在这里修改。
            # base_url="https://api.openai.com/v1",
            system_message="你是一个乐于助人的助手。",
        ),
        prompts=["写一首关于编程中递归的俳句。"],
    )
    chat
    return (chat,)


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()
