var documenterSearchIndex = {"docs":
[{"location":"util/","page":"Utilities","title":"Utilities","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/src/util.jl\"","category":"page"},{"location":"util/#Utilities","page":"Utilities","title":"Utilities","text":"","category":"section"},{"location":"util/","page":"Utilities","title":"Utilities","text":"Unlike every other file in the pipeline, this file is not intended to be run directly. Instead, include this in other files.","category":"page"},{"location":"util/","page":"Utilities","title":"Utilities","text":"using PowerSpectra\nusing DataFrames, CSV\n\n\nfunction util_planck_binning(binfile; lmax=6143)\n    bin_df = DataFrame(CSV.File(binfile;\n        header=false, delim=\" \", ignorerepeated=true))\n\n    # bin centers and binning matrix\n    lb = (bin_df[:,1] .+ bin_df[:,2]) ./ 2\n    P = binning_matrix(bin_df[:,1], bin_df[:,2], ℓ -> ℓ*(ℓ+1) / (2π); lmax=lmax)\n    return P, lb\nend\n\n\nfunction util_planck_beam_bl(T::Type, freq1, split1, freq2, split2, spec1_, spec2_;\n                        lmax=4000, beamdir=nothing)\n    if isnothing(beamdir)\n        @warn \"beam directory not specified. switching to PowerSpectra.jl fallback\"\n        beamdir = PowerSpectra.planck256_beamdir()\n    end\n    spec1 = String(spec1_)\n    spec2 = String(spec2_)\n\n    if parse(Int, freq1) > parse(Int, freq2)\n        freq1, freq2 = freq2, freq1\n        split1, split2 = split2, split1\n    end\n    if (parse(Int, freq1) == parse(Int, freq2)) && ((split1 == \"hm2\") && (split1 == \"hm1\"))\n        split1, split2 = split2, split1\n    end\n\n    fname = \"Wl_R3.01_plikmask_$(freq1)$(split1)x$(freq2)$(split2).fits\"\n    f = PowerSpectra.FITS(joinpath(beamdir, \"BeamWf_HFI_R3.01\", fname))\n    bl = convert(Vector{T}, read(f[spec1], \"$(spec1)_2_$(spec2)\")[:,1])\n    if lmax < 4000\n        bl = bl[1:lmax+1]\n    else\n        bl = vcat(bl, last(bl) * ones(T, lmax - 4000))\n    end\n    return SpectralVector(bl)\nend\nutil_planck_beam_bl(T::Type, freq1, split1, freq2, split2, spec1; kwargs...) =\n    util_planck_beam_bl(T, freq1, split1, freq2, split2, spec1, spec1; kwargs...)\nutil_planck_beam_bl(freq1::String, split1, freq2, split2, spec1, spec2; kwargs...) =\n    util_planck_beam_bl(Float64, freq1, split1, freq2, split2, spec1, spec2; kwargs...)","category":"page"},{"location":"PSPipePlanckRender/","page":"-","title":"-","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/src/PSPipePlanckRender.jl\"","category":"page"},{"location":"PSPipePlanckRender/","page":"-","title":"-","text":"module PSPipePlanckRender\n\n\nend","category":"page"},{"location":"binning/","page":"-","title":"-","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/src/binning.jl\"","category":"page"},{"location":"binning/","page":"-","title":"-","text":"# all examples are run on an example global.toml and downsized maps.\nARGS = [\"example.toml\"]","category":"page"},{"location":"binning/","page":"-","title":"-","text":"configfile = ARGS[1]\n\n# get modules and utility functions\nusing Plots\nusing TOML\ninclude(\"util.jl\")\n\nconfig = TOML.parsefile(configfile)\nnside = config[\"general\"][\"nside\"]\nlmax = nside2lmax(nside)\n\n# read binning scheme\nbinfile = joinpath(config[\"dir\"][\"pspipe_project\"], \"input\", \"binused.dat\")\nP, lb = util_planck_binning(binfile; lmax=lmax)\n\n#\nbl = util_planck_beam_bl(\"100\", \"hm1\", \"100\", \"hm2\", :TT, :TT;\n    lmax=lmax, beamdir=config[\"dir\"][\"beam\"])\nplot(bl, yaxis=:log10, label=\"\\$B_{\\\\ell}\\$\")","category":"page"},{"location":"pipeline/","page":"Pipeline","title":"Pipeline","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/docs/src/pipeline.md\"","category":"page"},{"location":"pipeline/#Pipeline","page":"Pipeline","title":"Pipeline","text":"","category":"section"},{"location":"pipeline/","page":"Pipeline","title":"Pipeline","text":"The following file lists the shell commands that comprise the pipeline.","category":"page"},{"location":"pipeline/","page":"Pipeline","title":"Pipeline","text":"<pre class=\"shell\">\n<code class=\"language-shell hljs\">julia src/setup.jl global.toml\n</code></pre>","category":"page"},{"location":"pipeline/","page":"Pipeline","title":"Pipeline","text":"<pre class=\"shell\">\n<code class=\"language-shell hljs\">sbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm1 P100hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm1 P143hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm1 P143hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm1 P217hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm1 P100hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm1 P217hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm1 P143hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm1 P143hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm1 P217hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm1 P100hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm1 P217hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm2 P143hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm2 P217hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm2 P100hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P143hm2 P217hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P217hm1 P217hm1\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P217hm1 P100hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P217hm1 P217hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm2 P100hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P100hm2 P217hm2\"\nsbatch scripts/4core1hr.cmd \"julia src/rawspectra.jl global.toml P217hm2 P217hm2\"\n</code></pre>","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/src/rawspectra.jl\"","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"# the example command line input for this script\nARGS = [\"example.toml\", \"P143hm1\", \"P143hm2\"]","category":"page"},{"location":"rawspectra/#rawspectra","page":"rawspectra.jl","title":"Raw Spectra (rawspectra.jl)","text":"","category":"section"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"The first step in the pipeline is simply to compute the pseudo-spectrum between the maps X and Y. We define the pseudo-spectrum widetildeC_ell as the result of the estimator on spherical harmonic coefficients of the masked sky,","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"widetildeC_ell = frac12ell+1 sum_m a^iX_ell m a^jY_ell m","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"Since we mask the galaxy and point sources, this is a biased estimate of the underlying power spectrum. The mask couples modes together, and also removes power from parts of the sky. This coupling is described by a linear operator mathbfM, the mode-coupling matrix. For more details on spectra and mode-coupling, please refer to the documentation for PowerSpectra.jl. If this matrix is known, then one can perform a linear solve to obtain an unbiased estimate of the underlying power spectrum C_ell,","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"langlewidetildeC_ellrangle =\nmathbfM^XY(ij)_ell_1 ell_2 langle C_ell rangle","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"This script performs this linear solve, without accounting for beams. The noise spectra are estimated from the difference of auto- and cross-spectra, The command-line syntax for using this component to compute mode-coupled spectra is","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"<pre class=\"shell\">\n<code class=\"language-shell hljs\">$ julia rawspectra.jl global.toml [map1] [map2]</code></pre>","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"[map1] and [map2] must be names of maps described in global.toml.","category":"page"},{"location":"rawspectra/#File-Loading-and-Cleanup","page":"rawspectra.jl","title":"File Loading and Cleanup","text":"","category":"section"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"This page shows the results of running the command","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"<pre class=\"shell\">\n<code class=\"language-shell hljs\">$ julia src/rawspectra.jl docs/src/example.toml  P143hm1 P143hm2</code></pre>","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"We start by loading the necessary packages.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"using TOML\nusing Healpix\nusing PowerSpectra\nusing Plots","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"The first step is just to unpack the command-line arguments, which consist of the TOML config file and the map names, which we term channels 1 and 2.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"configfile, mapid1, mapid2 = ARGS[1], ARGS[2], ARGS[3]","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"config = TOML.parsefile(configfile)","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"Next, we check to see if we need to render plots for the Documentation.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"if config[\"general\"][\"plot\"] == false\n    Plots.plot(args...; kwargs...) = nothing\n    Plots.plot!(args...; kwargs...) = nothing\nend","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"For both input channels, we need to do some pre-processing steps.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"We first load in the I, Q, and U Stokes vectors, which are FITS columns 1, 2, and 3 in the Planck map files. These must be converted from nested to ring ordered, to perform SHTs.\nWe read in the corresponding masks in temperature and polarization.\nWe zero the missing pixels in the maps, and also zero the corresponding pixels in the masks.\nWe convert from mathrmK_mathrmCMB to mu mathrmK_mathrmCMB.\nApply a small polarization amplitude adjustment, listed as poleff in the config.\nWe also remove some noisy pixels with mathrmsigma(Q)  10^6mumathrmK^2 or mathrmsigma(U)  10^6mumathrmK^2, or if they are negative. This removes a handful of pixels in the 2018 maps at 100 GHz which interfere with covariance estimation.\nEstimate and subtract the pseudo-monopole and pseudo-dipole.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"\"\"\"Return (polarized map, maskT, maskP) given a config and map identifier\"\"\"\nfunction load_maps_and_masks(config, mapid, maptype=Float64)\n    # read map file\n    println(\"Reading \", config[\"map\"][mapid])\n    mapfile = joinpath(config[\"dir\"][\"map\"], config[\"map\"][mapid])\n    polmap = PolarizedMap(\n        nest2ring(readMapFromFITS(mapfile, 1, maptype)),  # I\n        nest2ring(readMapFromFITS(mapfile, 2, maptype)),  # Q\n        nest2ring(readMapFromFITS(mapfile, 3, maptype)))  # U\n\n    # read maskT and maskP\n    maskfileT = joinpath(config[\"dir\"][\"mask\"], config[\"maskT\"][mapid])\n    maskfileP = joinpath(config[\"dir\"][\"mask\"], config[\"maskP\"][mapid])\n    maskT = readMapFromFITS(maskfileT, 1, maptype)\n    maskP = readMapFromFITS(maskfileP, 1, maptype)\n\n    # read Q and U pixel variances, and convert to μK\n    covQQ = nest2ring(readMapFromFITS(mapfile, 8, maptype)) .* 1e12\n    covUU = nest2ring(readMapFromFITS(mapfile, 10, maptype)) .* 1e12\n\n    # go from KCMB to μKCMB, and apply polarization factor\n    poleff = config[\"poleff\"][mapid]\n    scale!(polmap, 1e6, 1e6 * poleff)  # apply 1e6 to (I) and 1e6 * poleff to (Q,U)\n\n    # identify missing pixels and also pixels with crazy variances\n    missing_pix = (polmap.i .< -1.6e30)\n    missing_pix .*= (covQQ .> 1e6) .| (covUU .> 1e6) .| (covQQ .< 0.0) .| (covUU .< 0.0)\n    allowed = (~).(missing_pix)\n\n    # apply the missing pixels to the map and mask for T/P\n    mask!(polmap, allowed, allowed)\n    mask!(maskT, allowed)\n    mask!(maskP, allowed)\n\n    # fit and remove monopole/dipole in I\n    monopole, dipole = fitdipole(polmap.i, maskT)\n    subtract_monopole_dipole!(polmap.i, monopole, dipole)\n\n    return polmap, maskT, maskP\nend","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"We'll use this function for the half-missions involved here.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"m₁, maskT₁, maskP₁ = load_maps_and_masks(config, mapid1)\nm₂, maskT₂, maskP₂ = load_maps_and_masks(config, mapid2)\nplot(m₁.i, clim=(-200,200))  # plot the intensity map","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"plot(maskT₁)  # show the temperature mask","category":"page"},{"location":"rawspectra/#Computing-Spectra-and-Saving","page":"rawspectra.jl","title":"Computing Spectra and Saving","text":"","category":"section"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"Once you have cleaned up maps and masks, you compute the calculation is described in PowerSpectra - Mode Coupling. That package has a utility function master that performs the full MASTER calculation on two IQU maps with associated masks.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"Cl = master(m₁, maskT₁, maskP₁,\n            m₂, maskT₂, maskP₂)\nnside = maskT₁.resolution.nside  # get the resolution from any of the maps\nlmax = nside2lmax(nside)\nprintln(keys(Cl))  # check what spectra were computed","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"The PowerSpectra.jl package has the Planck bestfit theory and beams as utility functions, for demo and testing purposes. We can use it that for plotting here.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"spec = :TE\nbl = PowerSpectra.planck_beam_bl(\"100\", \"hm1\", \"100\", \"hm2\", spec, spec; lmax=lmax)\nell = eachindex(bl)\nprefactor = ell .* (ell .+ 1) ./ (2π)\nplot( prefactor .*  Cl[spec] ./ bl.^2, label=\"\\$D_{\\\\ell}\\$\", xlim=(0,2nside) )\ntheory = PowerSpectra.planck_theory_Dl()\nplot!(theory[spec], label=\"theory $(spec)\", ylim=(-200,300))","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"Now we save our spectra.","category":"page"},{"location":"rawspectra/","page":"rawspectra.jl","title":"rawspectra.jl","text":"using CSV, DataFrames\nrun_name = config[\"general\"][\"name\"]\nspectrapath = joinpath(config[\"dir\"][\"scratch\"], \"rawspectra\")\nmkpath(spectrapath)\n\n# assemble a table with the ells and spectra\ndf = DataFrame()\ndf[!,:ell] = ell\nfor spec in keys(Cl)\n    df[!,spec] = parent(Cl[spec])\nend\n\nCSV.write(joinpath(spectrapath, \"$(run_name)_$(mapid1)x$(mapid2).csv\"), df)","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/docs/src/index.md\"","category":"page"},{"location":"#Introduction","page":"Introduction","title":"Introduction","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"This is a Simons Observatory pipeline for computing the spectra and covariances of the Planck 2018 high-ell likelihood. Default settings have been chosen to reproduce the official textttplic analysis. The code is also described in Li et al. (in prep). Each page is directly generated from a source file used in the pipeline, in the style of Literate programming. Each source file can be located on the PSPipe GitHub using the Edit on GitHub link on the top of every page.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"All executed code within a pipeline component is displayed in light orange code blocks.\nComments in the pipeline components are rendered as markdown.\nThe rendered pages are run on low-resolution Planck 2018 half-mission maps and masks at 143 GHz, generated by harmonically reprojecting to n_mathrmside = 256.\nAt the top of each page, we provide examples for how to run the pipeline component on the Planck data.\nFor the full analysis described in Li et al. (in prep), consult the page on the Slurm files and cluster use.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"The map/alm handling routines for this project were contributed into the Healpix.jl package, and the mode-coupling and covariance matrix calculations were made into AngularPowerSpectra.jl. This pipeline mostly wrangles data and calls the routines from those packages.","category":"page"},{"location":"#Package-Installation","page":"Introduction","title":"Package Installation","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"We use the package manager in the Julia interpeter install the latest versions of Healpix and AngularPowerSpectra. This will be simpler in the future, when we tag a stable version of these packages for the General Registry.  For now, we add the latest versions of these packages from GitHub. Note that package  installation requires an internet connection, so unlike the other parts of the pipeline, setup.jl requires an internet connection. If you're on a cluster, that means you need  to run this file on the head node in order to install packages.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"<pre class=\"shell\">\n<code class=\"language-julia hljs\">using Pkg  \nPkg.add(PackageSpec(name=\"Healpix\", rev=\"master\")) \nPkg.add(url=\"git@github.com:xzackli/PowerSpectra.jl.git\")\nPkg.add([\"CSV\", \"DataFrames\", \"TOML\"])\n</code></pre>","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/src/setup.jl\"","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"# all examples are run on an example global.toml and downsized maps.\nARGS = [\"example.toml\"]","category":"page"},{"location":"setup/#Setup-(setup.jl)","page":"setup.jl","title":"Setup (setup.jl)","text":"","category":"section"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"This pipeline is written in Julia, so you will need a Julia installation in order to run the components. We recommend you use the precompiled binaries provided on the Julia website. Make sure to add the Julia executable to your path, as described in the platform-specific instructions.","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"The command-line interface for this basic pipeline setup script is","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"<pre class=\"shell\">\n<code class=\"language-shell hljs\">$ julia setup.jl global.toml</code></pre>","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"It displays the contents of the global TOML configuration file named global.toml.\nThis script downloads the Planck data to the specified directories in global.toml.","category":"page"},{"location":"setup/#Configuration","page":"setup.jl","title":"Configuration","text":"","category":"section"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"All of the pipeline scripts take a configuration TOML file as the first argument. We now print out just the [dir] entry in the TOML, which is what you will need to configure.","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"using TOML\nconfigfile = ARGS[1]  # read in the first command line argument\nprintln(\"config filename: \", configfile, \"\\n\")\n\n# take a look at the config\nconfig = TOML.parsefile(configfile)\nTOML.print(Dict(\"dir\"=>config[\"dir\"]))  # print just the \"dir\" TOML entry","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"The scratch space is where intermediary files are deposited.\nNote that each map file has an identifier. This shortens the long names, but more importantly allows one to set up a custom system of names when we cross-correlate Planck with other experiments.\nIn this case, we preface all Planck maps and masks with P, and include the frequency and split.","category":"page"},{"location":"setup/#Downloading-the-Planck-2018-Data","page":"setup.jl","title":"Downloading the Planck 2018 Data","text":"","category":"section"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"# set up download urls\nusing Downloads\n\nif length(ARGS) == 0\n    TARGET_DIR = pwd()\nelse\n    TARGET_DIR = ARGS[1]\nend\n\n# set up directories\nmapdest = config[\"dir\"][\"map\"]\nmaskdest = config[\"dir\"][\"mask\"]\nbeamdest = config[\"dir\"][\"beam\"]\nmkpath(mapdest)\nmkpath(maskdest)\nmkpath(beamdest)\n\nfunction download_if_necessary(url, dest; verbose=true)\n    if isfile(dest) == false\n        verbose && println(\"Downloading \", dest)\n        @time Downloads.download(url, dest)\n    else\n        verbose && println(\"Extant, skip \", dest)\n    end\nend","category":"page"},{"location":"setup/","page":"setup.jl","title":"setup.jl","text":"# now read from config and then actually download\nmapfiles = values(config[\"map\"])\nmaskfiles = [values(config[\"maskT\"])..., values(config[\"maskP\"])...]\n\nfor f in mapfiles\n    download_if_necessary(joinpath(config[\"url\"][\"maps\"], f), joinpath(mapdest, f))\nend\n\nfor f in maskfiles\n    download_if_necessary(joinpath(config[\"url\"][\"masks\"], f), joinpath(maskdest, f))\nend\n\n# just download beamfile to the target directory base.\nbeamfile = \"HFI_RIMO_BEAMS_R3.01.tar.gz\"\nfullbeamfile = joinpath(beamdest, beamfile)\ndownload_if_necessary(joinpath(config[\"url\"][\"beams\"], beamfile), fullbeamfile)\nrun(`cp $(fullbeamfile) $(joinpath(beamdest, \"tempbeamgz\"))`)\nrun(`gzip -f -d $(joinpath(beamdest, beamfile))`)\nrun(`mv $(joinpath(beamdest, \"tempbeamgz\")) $(fullbeamfile)`)\nbeamfiletar = replace(beamfile, \".tar.gz\"=>\".tar\")\nrun(`tar -xf $(joinpath(beamdest, beamfiletar)) --overwrite -C $(beamdest)`);\nnothing #hide","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"EditURL = \"https://github.com/simonsobs/PSpipe/tree/planckcov/project/Planck_cov/src/spectra_slurmgen.jl\"","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"# all examples are run on an example global.toml and downsized maps.\nARGS = [\"example.toml\"]","category":"page"},{"location":"spectra_slurmgen/#SLURM-Commands-for-Spectra-(spectra_slurmgen.jl)","page":"spectra_slurmgen.jl","title":"SLURM Commands for Spectra (spectra_slurmgen.jl)","text":"","category":"section"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"This command generates SLURM commands that executes rawspectra.jl on all the pairs of maps in the config.","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"# this file just prints out the SLURM commands required to compute the spectra\nusing TOML","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"The first step is just to unpack the command-line arguments, which consist of the TOML config file and the map names, which we term channels 1 and 2.","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"configfile = ARGS[1]\nconfig = TOML.parsefile(configfile)","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"Let's generate the commands we need for likelihood spectra.","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"mapids = [k for k in keys(config[\"map\"])]\nrun = \"sbatch scripts/4core1hr.cmd\"\nfor i in 1:length(mapids)\n    for j in i:length(mapids)\n        println(\"$(run) \\\"julia src/rawspectra.jl global.toml $(mapids[i]) $(mapids[j])\\\"\")\n    end\nend","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"I just paste these in and wait a few hours. The resulting spectra are deposited in the scratch dir in the config.","category":"page"},{"location":"spectra_slurmgen/#Plotting-Some-Examples","page":"spectra_slurmgen.jl","title":"Plotting Some Examples","text":"","category":"section"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"The resulting spectra are written to [scratch]/rawspectra/. When the documentation is rendered via GitHub actions, the example spectra are precomputed and downloaded, cooking-show style. Let's plot a spectrum.","category":"page"},{"location":"spectra_slurmgen/","page":"spectra_slurmgen.jl","title":"spectra_slurmgen.jl","text":"using CSV, DataFrames\n\nrun_name = config[\"general\"][\"name\"]\nmapids = [k for k in keys(config[\"map\"])]\nspectrapath = joinpath(config[\"dir\"][\"scratch\"], \"rawspectra\")\n\n# if allowed to plot, read a spectrum csv file and plot the EE spectrum\nif config[\"general\"][\"plot\"]\n    using Plots\n    mapid1 = mapids[1]\n    mapid2 = mapids[4]\n    spec = DataFrame(CSV.File(joinpath(spectrapath,\"$(run_name)_$(mapid1)x$(mapid2).csv\")))\n    plot(spec.ell, spec.ell.^2 .* spec.EE, label=\"$(run_name)_$(mapid1)x$(mapid2)\",\n        xlabel=\"multipole moment\", ylabel=\"\\$\\\\ell^2 C_{\\\\ell}^{EE}\\$\")\nend","category":"page"}]
}
