# ImageClassificationWeb

https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04

## Install project

```
git clone https://github.com/kirschovapetra/I-DP-2021-2022.git
```
```
cd I-DP-2021-2022/ImageClassificationWeb/
```
Create virtual environment
```
python3 -m venv ./venv
```
```
source venv/bin/activate
```
Install required python packages
```
pip install -r requirements.txt
```
Install node modules
```
cd frontend/
```
```
npm install --legacy-peer-deps
```
```
npm run dev
```
Test dev server
```
python manage.py runserver 0.0.0.0:8080
```

## Setup gunicorn
Instal gunicorn python package
```
source venv/bin/activate
```
```
pip install gunicorn
```
Test connection
```
 gunicorn -b 0.0.0.0:8080 ImageClassificationWeb.wsgi
```
Edit system files to allow service
```
 sudo gedit /etc/systemd/system/gunicorn.socket
 ```
> [Unit] <br>
> Description=gunicorn socket 
> 
> [Socket] <br>
> ListenStream=<mark>/home/petra/Documents/I-DP-2021-2022/ImageClassificationWeb/ImageClassificationWeb.sock</mark>
> 
> [Install] <br>
> WantedBy=sockets.target

```
 sudo gedit /etc/systemd/system/gunicorn.service
```
>[Unit] <br>
>Description=gunicorn daemon <br>
>Requires=<mark>gunicorn.socket</mark> <br>
>After=network.target
> 
>[Service] <br>
>User=<mark>petra</mark> <br>
>Group=<mark>www-data</mark> <br>
>WorkingDirectory=<mark>/home/petra/Documents/I-DP-2021-2022/ImageClassificationWeb</mark> <br>
>ExecStart=<mark>/home/petra/Documents/I-DP-2021-2022/ImageClassificationWeb/venv/bin/gunicorn</mark> --access-logfile - --workers 3 --bind unix:<mark>/home/petra/Documents/I-DP-2021-2022/ImageClassificationWeb/ImageClassificationWeb.sock ImageClassificationWeb</mark>.wsgi:application
> 
> [Install] <br>
> WantedBy=multi-user.target 

Reload and start service
```
systemctl daemon-reload 
```
```
sudo systemctl start gunicorn.socket
sudo systemctl start gunicorn
```
```
sudo systemctl restart gunicorn
sudo systemctl restart gunicorn.socket
```
```
sudo systemctl enable gunicorn
sudo systemctl enable gunicorn.socket
```
```
sudo systemctl status gunicorn
sudo systemctl status gunicorn.socket
```

# Setup Nginx
Edit system files to allow service
```
sudo apt install nginx
```
Edit system files to allow service
```
sudo gedit /etc/nginx/sites-available/ImageClassificationWeb
```
>server { <br>
>    listen <mark>80</mark>; <br>
>    server_name <mark>0.0.0.0</mark>; 
>
>    location = /favicon.ico { access_log off; log_not_found off; } <br>
>       location /static/ { <br>
>       root <mark>/home/petra/Documents/I-DP-2021-2022/ImageClassificationWeb/frontend</mark>;<br>
>    }
>
> location / { <br>
>    include proxy_params; <br>
>    proxy_pass http://unix:<mark>/home/petra/Documents/I-DP-2021-2022/ImageClassificationWeb/ImageClassificationWeb.sock</mark>; <br>
>    } <br>
>}

Create symbolic link
```
sudo ln -s /etc/nginx/sites-available/ImageClassificationWeb /etc/nginx/sites-enabled/
```
Check status
```
sudo nginx -t
```
Restart nginx service
```
sudo systemctl restart nginx
nginx
```
or Run nginx
```
nginx
```