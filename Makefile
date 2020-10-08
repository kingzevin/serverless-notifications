all: update

update: 
	./rezip.sh notifications
	wsk -i action update /guest/sharelatex/notifications notifications.zip --kind  nodejs:10 --web raw


