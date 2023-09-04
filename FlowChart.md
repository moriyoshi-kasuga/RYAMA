# RYAMA's FlowChart

## サイトの流れ

```mermaid
flowchart TD;

BOF([came to web site]) --> redirect_home(Render Home Page)

redirect_home --> homes
homes --> redirect_home
subgraph homes
    publish
    about
    features
end

redirect_home --> |go markdowns page| if_is_logined(if User is logined)
redirect_home --> |Account Tab Click| if_has_account
if_is_logined --> |yes| page_markdowns(Render Markdowns Page)
if_is_logined --> |no| if_has_account{if user already create account}
if_has_account --> |yes| action_login(Login Accout)
if_has_account --> |no| action_signup(Signup Account)
action_signup --> action_login
action_login --> page_markdowns

%% yellow は 一つのpageです
style publish color:yellow
style about color:yellow
style features color:yellow
style redirect_home color:yellow
style action_login color:yellow
style action_signup color:yellow
style page_markdowns color:yellow
```

# Markdowns Page

refrence: https://stackedit.io/app#

## どのようにMarkdownパージを表示するか

### Explorer

- create telescope filter file
- Render Explorer
- '.open-file' add to class of ActiveFile localStorage Id FileItem
- input event of '#file' to render makrdonw of '.markdown-body'
- chagne envet of '#file' to save change of it file id
- click folderItem to opensFolder localStorage

## file Element

```mermaid
flowchart TD

start(Create Element) --> loop_s[/loop children\]
loop_e[\end loop/]
loop_s --> if{is child is folder}
if --> |yes| loop_s
if --> |no| add_beforebegin(insert html to beforebegin of this loop child)
add_beforebegin --> loop_e
loop_e --> notBreaked{loop not breaked}
notBreaked --> |yes| add_node(add node insert afterbegin)

```
