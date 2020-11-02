while sleep 1; 
do curl -s -o /dev/null -w "%{url_effective}, %{response_code}, %{time_total}\n" http://patte-Patte-QCWWLNIV328X-2097487935.ap-southeast-2.elb.amazonaws.com/ ;
done
