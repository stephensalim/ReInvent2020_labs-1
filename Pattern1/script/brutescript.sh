#!/bin/bash

ALBURL=$1
while sleep 1; 
do curl --header "Content-Type: application/json" --request GET --data '{"Name":"Stephen","Key":"some-random-false-key"}' $ALBURL/decrypt
done