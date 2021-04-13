using PSPipePlanckRender
using Documenter

DocMeta.setdocmeta!(PSPipePlanckRender, :DocTestSetup, :(using PSPipePlanckRender); recursive=true)

makedocs(;
    modules=[PSPipePlanckRender],
    authors="Zack Li",
    repo="https://github.com/xzackli/PSPipePlanckRender.jl/blob/{commit}{path}#{line}",
    sitename="PSPipePlanckRender.jl",
    format=Documenter.HTML(;
        prettyurls=get(ENV, "CI", "false") == "true",
        canonical="https://xzackli.github.io/PSPipePlanckRender.jl",
        assets=String[],
    ),
    pages=[
        "Home" => "index.md",
    ],
)

deploydocs(;
    repo="github.com/xzackli/PSPipePlanckRender.jl",
    devbranch="main"
)
