#!/bin/bash
: '
This script generates the packages that are needed for realase. 

The packages are firstly built using `npm run build-all`. npm/electron-packager takes
care of most of it. After the output is given by electron-packager, it is then compressed
into:
 - .7z (best compression ration)
 - .tar.7z (preserver permissions + best compression)
 - .zip (tar for Windows + a little bit of compression)

There are consideration for compressing with xz also, as it is widely used on Linux, 
unlike 7z.     
'

rm -r electron-packager-output/

npm run build-all

compress7z () {
	echo "===== compressing "$1".7z ===== "
	7z a $1.7z $1
}

compresszip() {
	echo "===== compressing "$1".zip ===== "
	7z -tzip a $1.zip $1
}

compressTar7z() {
	echo "===== compressing "$1".tar.7z ===== "
	7z -ttar a $1.tar $1
	7z a $1.tar.7z $1.tar
	rm $1.tar
}

export -f compress7z
export -f compresszip
export -f compressTar7z

#Make a list of files
declare -a arr
for f in electron-packager-output/* ; do
	arr=("${arr[@]}" $f)
	echo "Going to compress "$f
done

#echo ${arr[@]}
#make commands for them
parallel -j 4 compress7z ::: "${arr[@]}";
parallel -j 4 compresszip ::: "${arr[@]}";
parallel -j 4 compressTar7z ::: "${arr[@]}";