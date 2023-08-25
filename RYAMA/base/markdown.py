import mistletoe


def convert_html(content: str) -> str:
    return mistletoe.markdown(content)
