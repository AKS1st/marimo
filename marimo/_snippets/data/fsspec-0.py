# Copyright 2026 Marimo. All rights reserved.

import marimo

__generated_with = "0.11.6"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""# 使用 fsspec 连接云存储（S3 和 GCS）""")
    return


@app.cell
def _():
    import fsspec
    return (fsspec,)


@app.cell
def _(fsspec):
    # 创建文件系统对象
    s3 = fsspec.filesystem(
        "s3",
        key="YOUR_ACCESS_KEY",  # AWS credentials
        secret="YOUR_SECRET_KEY",
        client_kwargs={"region_name": "us-east-1"},
    )

    # List buckets/files
    s3_files = s3.ls("your-bucket-name")
    print("S3 文件：", s3_files[:5])  # 显示前 5 个文件
    return s3, s3_files


@app.cell
def _(fsspec):
    # 创建文件系统对象
    gcs = fsspec.filesystem(
        "gcs",
        # GCS will use default credentials from environment
        token=None,
    )

    # List buckets/files
    gcs_files = gcs.ls("your-gcs-bucket")
    print("GCS 文件：", gcs_files[:5])  # 显示前 5 个文件
    return gcs, gcs_files


@app.cell
def _():
    import marimo as mo
    return (mo,)


if __name__ == "__main__":
    app.run()

