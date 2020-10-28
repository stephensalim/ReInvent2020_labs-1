while sleep 1; 
do curl -s -o /dev/null -w "%{url_effective}, %{response_code}, %{time_total}\n" http://patte-Patte-59SF9NWW6GI2-754260502.ap-southeast-2.elb.amazonaws.com/ ;
done