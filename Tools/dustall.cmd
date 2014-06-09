pushd ..\UI\groupmanagement\html
for %%F in (*.dust) do (
	call dustc.cmd %%F %%~nF_dust.js
)
popd