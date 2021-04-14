using PSPipePlanckRender
using Documenter
using PyPlot
PyPlot.svg(true)
rcParams = PyPlot.PyDict(PyPlot.matplotlib."rcParams")
rcParams["font.family"] = "Latin Modern Roman"

SMALL_SIZE = 12
MEDIUM_SIZE = 15
BIGGER_SIZE = 18
rcParams["font.size"] = SMALL_SIZE
rcParams["axes.titlesize"] = SMALL_SIZE
rcParams["axes.labelsize"] = MEDIUM_SIZE
rcParams["xtick.labelsize"] = SMALL_SIZE
rcParams["ytick.labelsize"] = SMALL_SIZE
rcParams["legend.fontsize"] = SMALL_SIZE
rcParams["figure.titlesize"] = BIGGER_SIZE


DocMeta.setdocmeta!(PSPipePlanckRender, :DocTestSetup, :(using PSPipePlanckRender); recursive=true)

makedocs(;
    modules=[PSPipePlanckRender],
    authors="Zack Li",
    repo="https://github.com/xzackli/PSPipePlanckRender.jl/blob/{commit}{path}#{line}",
    sitename="PSPipe Planck",
    format=Documenter.HTML(;
        prettyurls=get(ENV, "CI", "false") == "true",
        canonical="https://xzackli.github.io/PSPipePlanckRender.jl",
        assets=String[],
        # edit_link=nothing,
        footer="Markdown rendering of the [PSPipe](https://github.com/simonsobs/PSpipe) Planck project using [Literate](https://fredrikekre.github.io/Literate.jl/) and [Documenter](https://juliadocs.github.io/Documenter.jl/dev/)."
    ),
    pages=[
        "Home" => "index.md",
    ],
)

deploydocs(;
    repo="github.com/xzackli/PSPipePlanckRender.jl",
    devbranch="main"
)
