<?php
    $apiKey = 'XXXXXXKEEPSECRETXXXXXX';
    $apiRoot = 'http://api.opencagedata.com/geocode/v1/json';
     
    if(!isset($_GET['endpoint'])) die(); // if we don't have any endpoint parameter we return an empty page
    
    //session control: if no session (not coming from taxomap website!), we die
    session_start();
    //if no session variable or an old one
    if(!$_SESSION["tm3"] || (microtime(true) - $_SESSION["tm3"] > 10) ) {
        die();
    }
    //unset($_SESSION["tm3"]);
    
    // Build up the URL
    if($_GET['endpoint'] == 'opencage') $url = $apiRoot . '?key=' . $apiKey;
    //if($_GET['endpoint'] == 'anotherService') $url = $apiRoot2 . '?apikey=' . $apiKey2;
     
    // Now add any additional GET parameters http://api.opencagedata.com/geocode/v1/json?key=XXXXXXKEEPSECRETXXXXXX&param1=value&param2=value
    foreach ($_GET as $key => $value) {
        if ($key != 'endpoint') {
            $url = $url . '&' . $key . '=' . urlencode($value);
        }
    }
     
    // Send the request to the API and return the result to the client
    $outData = file_get_contents($url);
    
    header('Content-Type: application/json');
    echo($outData);
?>