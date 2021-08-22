<?php

$host = 'mysql-db';
$username = 'chessqueen';
$password = '123456789';
$db = 'ip_address';
$errors = [];

$ip = $_SERVER['REMOTE_ADDR'];
$ip_remote = 'https://ipapi.co/'.$ip.'/json';
$timezone = 'America/New_York';

$conn = new mysqli($host, $username, $password, $db);

if ($conn->connect_error) {
    $errors[] = 'Connection to db failed';
}

// fetch data based on ip
$response = file_get_contents($ip_remote);
$data = json_decode($response, true);

$handleData = function ($key) use ($data) {
    if ($data['error']) {
        return '';
    }

    return $data[$key];
};

$create_table_query = 'CREATE TABLE IF NOT EXISTS ips (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  ip VARCHAR(50) NOT NULL,
  timezone VARCHAR(255),
  city VARCHAR(255),
  country VARCHAR(255),
  region VARCHAR(255),
  latitude DECIMAL(8, 6),
  longitude DECIMAL(9, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)';

$insert_query = "INSERT INTO ips(ip, timezone) VALUES('".$ip."', '".$timezone."')";

if (!$data['error']) {
    $insert_query = "INSERT INTO ips (
    ip, timezone, city, country, region, latitude, longitude
    ) VALUES('".$ip."', '".$handleData('timezone')."', '".$handleData('city')."', '".$handleData('country')."', 
    '".$handleData('region')."', '".$handleData('latitude')."', '".$handleData('longitude')."'
    )";
}

$fetch_query = 'SELECT * FROM ips ORDER BY created_at DESC';

// create table query
if (true !== $conn->query($create_table_query)) {
    $errors[] = 'Creating ip table failed: '.$conn->error;
}

// insert into table query
if (true !== $conn->query($insert_query)) {
    $errors[] = 'Inserting ip data to table failed: '.$conn->error;
}

// format date
$formatDate = function ($input, $tz) use ($timezone) {
    if (!$tz) {
        $tz = $timezone;
    }

    $date = new DateTime($input, new DateTimeZone('UTC'));

    $date->setTimezone(new DateTimeZone($tz));

    return $date->format('Y.m.d H:i:s');
};

// fetch from table query
$store = [];
$result = $conn->query($fetch_query);
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $store[] = [
            'id' => $row['id'],
            'ip' => $row['ip'],
            'timezone' => $row['timezone'],
            'city' => $row['city'],
            'country' => $row['country'],
            'region' => $row['region'],
            'latitude' => $row['latitude'],
            'longitude' => $row['longitude'],
            'created_at' => $formatDate($row['created_at'], $row['timezone']),
        ];
    }
}

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IP Navigator | Home</title>

    <link
      href="https://fonts.googleapis.com/css?family=Roboto:400,100,300,700"
      rel="stylesheet"
      type="text/css"
    />
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
    />
    <link rel="stylesheet" href="assets/css/styles.css" />
  </head>
  <body>
    <section class="ftco-section">
      <div class="container">
        <?php if (count($errors) > 0) { ?>
          <div class="row">
            <div class="col-md-12">
              <div class="alert alert-danger">
                <ul class="mb-0">
                  <?php foreach ($errors as $error) { ?>
                    <li><?php echo $error; ?></li>
                  <?php } ?>
                </ul>
              </div>
            </div>
          </div>
        <?php } ?>
        <div class="row justify-content-center">
          <div class="col-md-6 text-center mb-2">
            <!-- <h4>Önceden yapılan tüm istekler</h4> -->
            <h2 class="heading-section">IP Adresiniz: <?php echo $ip; ?></h2>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="table-wrap">
              <table class="table table-bordered table-dark table-hover">
                <thead>
                  <tr>
                    <th colspan="4">
                      <h4
                        class="
                          h5
                          text-center text-success
                          my-0
                          font-weight-bold
                        "
                      >
                        Önceden yapılan tüm istekler
                      </h4>
                    </th>
                  </tr>
                  <tr>
                    <th>#</th>
                    <th>Tarih</th>
                    <th>IP Adresi</th>
                    <th>Saat Dilimi</th>
                  </tr>
                </thead>
                <tbody>
                  <?php if (count($store) > 0) { ?>
                    <?php foreach ($store as $key => $value) { ?>
                      <tr>
                        <th scope="row"><?php echo $key + 1; ?></th>
                        <td><?php echo $value['created_at']; ?></td>
                        <td><?php echo $value['ip']; ?></td>
                        <td><?php echo $value['timezone']; ?></td>
                      </tr>
                    <?php } ?>
                  <?php } else { ?>
                    <tr>
                      <td rowspan="3" align="center">No data to display</td>
                    </tr>
                  <?php } ?>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  </body>
</html>
