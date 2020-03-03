<?php

define('JSMIN_AS_LIB', true); // prevents auto-run on include
include('jsmin.php');
// create the JSMin class, indicating no output file is desired
array_shift($argv);
foreach( $argv as $file )
{
    $jsMin = new JSMin($file, '-');
    $jsMin->minify();
}
