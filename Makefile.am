AUTOMAKE_OPTIONS = foreign

SUBDIRS = bin doc conf src 

doc_DATA = README.md CHANGES LICENSE

EXTRA_DIST = configure.ac \
			 Makefile.am \
			 README.md \
			 CHANGES  \
			 LICENSE \
			 dashboard

dist-hook:
	rm -rf `find $(distdir)/doc -type d -name .git`

install-data-hook:
	cp  -r dashboard $(localdatadir)

uninstall-hook:
	rm -rf $(localdatadir)
	rm -rf $(locallibdir)
	rm -rf $(localconfdir)
	rm -rf $(localdocdir)
