<?php
/**
 * Script used to convert docbook source to human readable docs
 *
 * @copyright (c) 2007-2022 G. Giunta
 */

if ($_SERVER['argc'] < 4)
  die("Usage: php convert.php docbook.xml \path\\to\stylesheet.xsl output-dir|output_file\n");
else
  echo "Starting xsl conversion process...\n";

$doc = $_SERVER['argv'][1];
$xss = $_SERVER['argv'][2];

if (!file_exists($doc))
  die("KO: file $doc cannot be found\n");
if (!file_exists($xss))
  die("KO: file $xss cannot be found\n");

// Load the XML source
$xml = new DOMDocument;
$xml->load($doc);
$xsl = new DOMDocument;
$xsl->load($xss);

// Configure the transformer
$proc = new XSLTProcessor;
$proc->importStyleSheet($xsl); // attach the xsl rules

//if ($_SERVER['argc'] >= 4)
//{
  if (is_dir($_SERVER['argv'][3]))
  {

    if (!$proc->setParameter('', 'base.dir', $_SERVER['argv'][3]))
      echo "setting param base.dir KO\n";
  }
  else
  {
    //echo "{$_SERVER['argv'][3]} is not a dir\n";
  }
//}
  $out = $proc->transformToXML($xml);
  if (!is_dir($_SERVER['argv'][3]))
    file_put_contents($_SERVER['argv'][3], $out);

echo "OK\n";
?>
