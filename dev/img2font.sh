#!/bin/bash

magick $1 -depth 8 -colorspace Gray -crop 3x5 gray:output-%03d.raw && \
ruby -e 'puts ARGV.map {|f| File.read(f).bytes.reduce(0) {|a,x| (a<<1)|(~x&1) } }.filter(&:nonzero?).join(",")' output-*.raw && \
rm output-*.raw