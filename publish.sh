#!/bin/bash
: '
Warning: You will need at least 12GB of ram to run this script. 

This script generates the packages that are needed for realase. You will most likely 
never need it.

The packages are firstly built using `npm run build-all`. npm/electron-packager takes
care of most of it. After the output is given by electron-packager, it is then compressed
into:
 - .7z (best compression ration)
 - .zip (tar for Windows + a little bit of compression)
 - .tar.gz (for Mac / Darwin and Linux)
 - .tar.xz (for Linux)
'

rm -r electron-packager-output/
npm run build-all

# Make directories for different packages
mkdir electron-packager-output/darwin/
mkdir electron-packager-output/mac/
mkdir electron-packager-output/windows/
mkdir electron-packager-output/linux/

# Move binaries to their respected folders
mv electron-packager-output/*\-darwin\-* electron-packager-output/darwin/
mv electron-packager-output/*\-win*\-* electron-packager-output/windows/
mv electron-packager-output/*\-mas\-* electron-packager-output/mac/
mv electron-packager-output/*\-linux\-* electron-packager-output/linux/

# Define compression functions
compress7z () {
	echo "===== compressing "$1".7z ===== "
	7z a -m0=LZMA2:d=384m -md=384M -mmt=1 -mx=9 -myx=9 -ms=on -mtm=off -mtr=off $1.7z $1
}

compressZip() {
	echo "===== compressing "$1".zip ===== "
	7z -tzip a $1.zip $1
}

createTar() {
	echo "===== creating "$1".tar ===== "
	tar -cf $1.tar $1
}

compressTarXz() {
	echo "===== compressing "$1".tar.xz ===== "
	xz -zek -9 $1.tar  
}

compressTarGz() {
	echo "===== compressing "$1".tar.gz ===== "
	gzip -k $1.tar
}

export -f compress7z
export -f compressZip
export -f createTar
export -f compressTarXz
export -f compressTarGz

# Make a list of files
declare -a darwinlist
for f in electron-packager-output/darwin/* ; do
	darwinlist=("${darwinlist[@]}" "$f")
	echo "Going to compress as darwin: "$f
done

declare -a windows
for f in electron-packager-output/windows/* ; do
	windows=("${windows[@]}" "$f")
	echo "Going to compress as windows: "$f
done

declare -a mac
for f in electron-packager-output/mac/* ; do
	mac=("${mac[@]}" "$f")
	echo "Going to compress as mac: "$f
done

declare -a linux
for f in electron-packager-output/linux/* ; do
	linux=("${linux[@]}" "$f")
	echo "Going to compress as linux: "$f
done

echo "${darwinlist[@]}";
echo "${windows[@]}";
echo "${mac[@]}";
echo "${linux[@]}";

# Make commands for them

# Darwin
parallel -j 0 createTar ::: "${darwinlist[@]}";
parallel -j 0 compressTarGz ::: "${darwinlist[@]}";

# Mac
parallel -j 0 createTar ::: "${mac[@]}";
parallel -j 0 compressTarGz ::: "${mac[@]}";

# Windows
parallel -j 0 compressZip ::: "${windows[@]}";
parallel -j 3 compress7z ::: "${windows[@]}";

# Linux
parallel -j 0 createTar ::: "${linux[@]}";
parallel -j 3 compressTarXz ::: "${linux[@]}";
parallel -j 3 compress7z ::: "${linux[@]}";

# cleanup
rm electron-packager-output/*/*.tar

mkdir electron-packager-output/to-upload/
mv electron-packager-output/*/*.{zip,xz,gz,7z} electron-packager-output/to-upload/

echo "finished";
